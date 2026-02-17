clear; clc;

% --- 1. تعریف ورودی‌ها (طبق جدول 2 مقاله برای سیستم بانکی) ---
% کامپوننت‌ها: 10 عدد
% R_base: قابلیت اطمینان پایه هر کامپوننت
R_base = [0.999, 0.974, 0.970, 0.982, 0.960, 0.999, 0.985, 0.992, 0.975, 0.964]; 
n_components = 10;

% فرض پارامترهای لاندا (مقادیر فرضی برای اجرا، در واقعیت باید دقیق محاسبه شوند)
% در اینجا فرض می‌کنیم لانداها محاسبه شده‌اند (خروجی مرحله قبل)
Lambda = [1.0, 0.8, 0.7, 0.8, 0.8, 0.8, 0.8, 0.8, 1.0, 1.0]; 

% --- 2. تعریف معماری‌ها (Mapping Components to States) ---
% طبق بخش 4.1 مقاله (Experiment):
% - کامپوننت 2 و 3 موازی هستند (Parallel State) -> تبدیل می‌شوند به State 2
% - کامپوننت 4 و 5 تحمل خطا (Fault Tolerance) هستند -> تبدیل می‌شوند به State 3
% - سایر کامپوننت‌ها تکی (Sequence) هستند.

% تعریف ساختار وضعیت‌ها (States)
% هر سطر: [نوع_معماری, لیست_کامپوننت‌ها]
% نوع 1: Sequence
% نوع 2: Parallel
% نوع 3: Interrupt Fault Tolerance (Recovery Block)

States = {
    1, [1];       % State 1: Component 1 (Sequence)
    3, [4, 5];    % State 2: Components 4 & 5 (Fault Tolerance - Main & Backup)
    2, [2, 3];    % State 3: Components 2 & 3 (Parallel)
    1, [6];       % State 4
    1, [7];       % State 5
    1, [8];       % State 6
    1, [9];       % State 7
    1, [10];      % State 8 (Output)
};

n_states = size(States, 1);
R_States = zeros(1, n_states);

% --- 3. محاسبه قابلیت اطمینان هر وضعیت (فرمول‌های بخش 3.4) ---
fprintf('--- محاسبه R برای وضعیت‌ها بر اساس نوع معماری ---\n');

for i = 1:n_states
    type = States{i, 1};
    comps = States{i, 2};
    
    % استخراج r و lambda برای کامپوننت‌های این وضعیت
    r_vals = R_base(comps);
    l_vals = Lambda(comps);
    
    % محاسبه r_i ^ lambda_i برای هر عضو
    r_impacted = r_vals .^ l_vals;
    
    switch type
        case 1 % Sequence Batch (معادله 5)
            % R = r ^ lambda
            R_States(i) = r_impacted; 
            fprintf('State %d (Seq): R = %.4f\n', i, R_States(i));
            
        case 2 % Parallel Batch (معادله 6)
            % R = Product(r_i ^ lambda_i)
            % همه باید سالم باشند تا سیستم کار کند
            R_States(i) = prod(r_impacted);
            fprintf('State %d (Par): Components %s -> R = %.4f\n', i, mat2str(comps), R_States(i));
            
        case 3 % Interrupt Fault Tolerance (معادله 7)
            % R = 1 - Product(1 - r_i ^ lambda_i)
            % سیستم فقط زمانی خراب می‌شود که همه خراب شوند
            R_States(i) = 1 - prod(1 - r_impacted);
            fprintf('State %d (FT):  Components %s -> R = %.4f\n', i, mat2str(comps), R_States(i));
            
        otherwise
            error('نوع معماری ناشناخته است');
    end
end

% --- 4. ساخت ماتریس انتقال بین وضعیت‌ها (Q_prime) ---
% حالا که R_States را داریم، باید ماتریس انتقال بین **وضعیت‌ها** را بسازیم.
% توجه: ماتریس P باید بین Stateها باشد، نه کامپوننت‌ها.
% فرض می‌کنیم گراف ساده شده به صورت متوالی است (S1 -> S2 -> ... -> S8)
% برای مثال واقعی باید گراف Stateها (شکل 10 مقاله) را کد کنید.

% ماتریس انتقال فرضی بین وضعیت‌ها (State Transition Probability)
P_states = zeros(n_states, n_states);
% اتصال خطی برای مثال: 1->2, 2->3, ...
for i = 1:n_states-1
    P_states(i, i+1) = 1.0; 
end

% ساخت ماتریس Q' (قانون 3 و معادله 9 مقاله)
% Q'(i,j) = R_State(i) * P_states(i,j)
Q_prime = zeros(n_states, n_states);
for i = 1:n_states
    for j = 1:n_states
        if P_states(i,j) > 0
            Q_prime(i,j) = R_States(i) * P_states(i,j);
        end
    end
end

% --- 5. محاسبه نهایی قابلیت اطمینان سیستم (معادله 12) ---
% حذف سطر و ستون آخر برای محاسبه ماتریس بنیادی (زیرا وضعیت آخر Absorbing است)
Q_reduced = Q_prime(1:end-1, 1:end-1);
I = eye(size(Q_reduced));

% فرمول حل ماتریسی: R_sys = (I - Q')^-1 * R_last_transient
% محاسبه احتمال رسیدن به وضعیت آخر
Fundamental_Matrix = inv(I - Q_reduced);

% فرض می‌کنیم آخرین وضعیت (S8) هدف نهایی است
% بردار احتمال ورود به وضعیت نهایی از وضعیت‌های قبلی
R_to_end = Q_prime(1:end-1, end); 

% قابلیت اطمینان کل (احتمال جذب در وضعیت موفقیت)
R_System_Vector = Fundamental_Matrix * R_to_end;
R_System_Final = R_System_Vector(1); % شروع از وضعیت 1

fprintf('\nقابلیت اطمینان نهایی سیستم: %.6f\n', R_System_Final);