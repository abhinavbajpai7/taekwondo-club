-- ==============================================================================
-- TAEKWONDO CLUB ATTENDANCE & FEE MANAGEMENT PWA
-- Initial Database Migration (Schema, Tables, RLS, Indexes & Security)
-- ==============================================================================

-- 1. EXTENSIONS
create extension if not exists "uuid-ossp";

-- 2. TABLES

-- Table: students (Stored once, referenced across attendance & payments)
create table if not exists public.students (
    id uuid primary key default gen_random_uuid(),
    student_code text unique not null,
    name text not null,
    date_of_birth date,
    parent_name text not null,
    parent_phone text not null,
    address text,
    joining_date date not null default current_date,
    monthly_fee numeric(10, 2) not null default 1000 check (monthly_fee >= 0),
    active boolean not null default true,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Table: profiles (Connects Supabase auth.users to an application role)
create table if not exists public.profiles (
    id uuid primary key references auth.users(id) on delete cascade,
    role text not null check (role in ('admin', 'student')),
    student_id uuid references public.students(id) on delete set null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Table: attendance (Date-wise attendance register with unique constraint)
create table if not exists public.attendance (
    id uuid primary key default gen_random_uuid(),
    student_id uuid not null references public.students(id) on delete cascade,
    attendance_date date not null,
    status text not null check (status in ('present', 'absent')),
    marked_at timestamp with time zone default timezone('utc'::text, now()) not null,
    marked_by uuid references auth.users(id),
    constraint unique_student_attendance_date unique (student_id, attendance_date)
);

-- Table: payments (Ledger of all student fee payments)
create table if not exists public.payments (
    id uuid primary key default gen_random_uuid(),
    student_id uuid not null references public.students(id) on delete cascade,
    payment_date date not null default current_date,
    amount numeric(10, 2) not null check (amount > 0),
    payment_method text not null default 'cash' check (payment_method in ('cash', 'upi', 'bank_transfer', 'other')),
    receipt_number text,
    notes text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. INDEXES FOR PERFORMANCE
create index if not exists idx_students_active on public.students(active);
create index if not exists idx_students_code on public.students(student_code);
create index if not exists idx_attendance_date on public.attendance(attendance_date);
create index if not exists idx_attendance_student on public.attendance(student_id);
create index if not exists idx_payments_student on public.payments(student_id);
create index if not exists idx_payments_date on public.payments(payment_date);

-- 4. HELPER FUNCTIONS FOR SECURITY (RLS)
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

create or replace function public.get_auth_student_id()
returns uuid
language sql
security definer
stable
as $$
  select student_id from public.profiles
  where id = auth.uid() and role = 'student'
  limit 1;
$$;

-- 5. ENABLE ROW LEVEL SECURITY (RLS)
alter table public.profiles enable row level security;
alter table public.students enable row level security;
alter table public.attendance enable row level security;
alter table public.payments enable row level security;

-- 6. RLS POLICIES

-- PROFILES POLICIES
create policy "Users can view their own profile"
    on public.profiles for select
    using (auth.uid() = id);

create policy "Admins can view all profiles"
    on public.profiles for select
    using (public.is_admin());

create policy "Admins can update profiles"
    on public.profiles for update
    using (public.is_admin());

create policy "Admins can insert profiles"
    on public.profiles for insert
    with check (public.is_admin());

-- STUDENTS POLICIES
create policy "Admins can do everything on students"
    on public.students for all
    using (public.is_admin())
    with check (public.is_admin());

create policy "Students can view only their own student record"
    on public.students for select
    using (id = public.get_auth_student_id());

-- ATTENDANCE POLICIES
create policy "Admins can do everything on attendance"
    on public.attendance for all
    using (public.is_admin())
    with check (public.is_admin());

create policy "Students can view only their own attendance"
    on public.attendance for select
    using (student_id = public.get_auth_student_id());

-- PAYMENTS POLICIES
create policy "Admins can do everything on payments"
    on public.payments for all
    using (public.is_admin())
    with check (public.is_admin());

create policy "Students can view only their own payments"
    on public.payments for select
    using (student_id = public.get_auth_student_id());

-- 7. TRIGGER: AUTOMATIC STUDENT CODE GENERATION (e.g. STU001, STU002)
create or replace function public.generate_student_code()
returns trigger
language plpgsql
as $$
declare
    next_num integer;
begin
    if new.student_code is null or new.student_code = '' then
        select coalesce(max(nullif(regexp_replace(student_code, '^STU', ''), '')), '0')::integer + 1
        into next_num
        from public.students;
        
        new.student_code := 'STU' || lpad(next_num::text, 3, '0');
    end if;
    return new;
end;
$$;

create trigger trigger_generate_student_code
    before insert on public.students
    for each row
    execute function public.generate_student_code();

-- 8. TRIGGER: UPDATED_AT TIMESTAMP
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
    new.updated_at = timezone('utc'::text, now());
    return new;
end;
$$;

create trigger trigger_students_updated_at
    before update on public.students
    for each row
    execute function public.handle_updated_at();
