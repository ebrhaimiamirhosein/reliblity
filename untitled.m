clear; clc;
format long g;

%% Banking-system inputs (Table 2)
componentNames = {'C1','C2','C3','C4','C5','C6','C7','C8','C9','C10'};
r_base = [0.999; 0.974; 0.970; 0.982; 0.960; 0.999; 0.985; 0.992; 0.975; 0.964];
nComp = numel(r_base);

inputComp = 1;   % C1
outputComp = 10; % C10

assert(nComp == 10, 'This implementation is for the 10-component banking system.');

%% 1) Component-level DTMC for Eq. (2) visitation counts
% Transition probabilities are built from the banking-system case study.
% Micro-adjustment requested by user:
%   - C1 branching is forced symmetric (0.5/0.5).
% Other branch probabilities remain as paper values where explicitly given.
P_comp = zeros(nComp, nComp);

P_comp(1,2) = 0.50; P_comp(1,3) = 0.50;
P_comp(2,4) = 0.50; P_comp(2,5) = 0.50;
P_comp(3,4) = 0.50; P_comp(3,5) = 0.50;
P_comp(4,6) = 0.40; P_comp(4,7) = 0.40; P_comp(4,8) = 0.20;
P_comp(5,6) = 0.40; P_comp(5,7) = 0.40; P_comp(5,8) = 0.20;
P_comp(6,9) = 0.75; P_comp(6,10) = 0.25;
P_comp(7,9) = 0.75; P_comp(7,10) = 0.25;
P_comp(8,9) = 0.75; P_comp(8,10) = 0.25;
P_comp(9,6) = 1/3;  P_comp(9,7) = 1/3;  P_comp(9,8) = 1/3;
P_comp(10,10) = 1.0; % absorbing success component

transientComp = 1:(nComp-1);
rowSumsComp = sum(P_comp(transientComp, :), 2);
assert(all(abs(rowSumsComp - 1.0) < 1e-12), 'Component DTMC rows must sum to 1.');

%% 2) Eq. (2): InS(i) = E(mu_i) via fundamental matrix N = (I - Q)^(-1)
Q_comp = P_comp(transientComp, transientComp);
N_comp = inv(eye(numel(transientComp)) - Q_comp);

E_mu = zeros(nComp, 1);
E_mu(transientComp) = N_comp(inputComp, :).';
E_mu(outputComp) = 1.0;

% Optional self-influence normalization check.
% Keep 'none' for paper-consistent computation.
selfInfluenceMode = 'none'; % {'none','by_total','by_max','cap1'}
switch selfInfluenceMode
    case 'none'
        InS = E_mu;
    case 'by_total'
        InS = E_mu / sum(E_mu);
    case 'by_max'
        InS = E_mu / max(E_mu);
    case 'cap1'
        InS = min(E_mu, 1.0);
    otherwise
        error('Unknown selfInfluenceMode: %s', selfInfluenceMode);
end

%% 3) Eq. (3) and Eq. (4): failure and propagation influence
% Directed graph adjacency (exclude self-loops from degree calculations).
adj = (P_comp > 0);
adj(1:nComp+1:end) = false;

outDegree = sum(adj, 2);
inDegree = sum(adj, 1).';

InF = zeros(nComp, 1);
InP = zeros(nComp, 1);

for i = 1:nComp
    % Requester set A for Ci: all Cj such that Cj -> Ci
    A = find(adj(:, i));
    n1 = numel(A);
    if n1 > 0
        InF(i) = sum(InS(A) ./ outDegree(A)) / n1;
    end

    % Provider set B for Ci: all Ck such that Ci -> Ck
    B = find(adj(i, :));
    n2 = numel(B);
    if n2 > 0
        InP(i) = sum(InS(B) ./ inDegree(B)) / n2;
    end
end

%% 4) Eq. (1): component influence lambda_i
% Paper reports alpha1 = alpha2 = 1/3 for the case study.
% Micro-adjustment requested by user: slightly tune weights.
alpha1 = 0.33;
alpha2 = 0.37;
phi = alpha1 + alpha2;

lambda = alpha1 .* InF + alpha2 .* InP + (1 - phi) .* InS;

% Section 3.2 note: for input/output components, self-influence dominates.
lambda([inputComp, outputComp]) = InS([inputComp, outputComp]);

%% 5) Architecture mapping and state reliabilities (Eq. 5, 6, 7)
% User-required mapping:
% - Parallel (Eq. 6): C2, C3
% - Fault tolerance (Eq. 7): C4, C5
% - Sequence (Eq. 5): all other components
stateNames = {'S1','S23','ST45','S6','S7','S8','S9','S10'};
stateTypes = {'sequence','parallel','fault_tolerance','sequence','sequence','sequence','sequence','sequence'};
stateComps = { [1], [2 3], [4 5], [6], [7], [8], [9], [10] };

nStates = numel(stateNames);
R_state = zeros(nStates, 1);

for s = 1:nStates
    comps = stateComps{s};
    r_vals = r_base(comps);
    l_vals = lambda(comps);
    r_impacted = r_vals .^ l_vals;

    switch stateTypes{s}
        case 'sequence' % Eq. (5)
            R_state(s) = prod(r_impacted);
        case 'parallel' % Eq. (6)
            R_state(s) = prod(r_impacted);
        case 'fault_tolerance' % Eq. (7) - recovery block / interrupt FT
            R_state(s) = 1 - prod(1 - r_impacted);
        otherwise
            error('Unknown state type: %s', stateTypes{s});
    end
end

%% 6) State transition probabilities from banking global-state model
% Figure 10 structure adapted to user-requested mapping:
% S1 -> S23 -> ST45 -> {S6,S7,S8}; {S6,S7,S8} -> S9 -> {S6,S7,S8}; and
% {S6,S7,S8} -> S10 (final absorbing success state).
S = struct('S1',1,'S23',2,'ST45',3,'S6',4,'S7',5,'S8',6,'S9',7,'S10',8);
P_state = zeros(nStates, nStates);

P_state(S.S1,  S.S23)  = 1.00;
P_state(S.S23, S.ST45) = 1.00;
P_state(S.ST45,S.S6)   = 0.40;
P_state(S.ST45,S.S7)   = 0.40;
P_state(S.ST45,S.S8)   = 0.20;
P_state(S.S6,  S.S9)   = 0.75;
P_state(S.S6,  S.S10)  = 0.25;
P_state(S.S7,  S.S9)   = 0.75;
P_state(S.S7,  S.S10)  = 0.25;
P_state(S.S8,  S.S9)   = 0.75;
P_state(S.S8,  S.S10)  = 0.25;
P_state(S.S9,  S.S6)   = 1/3;
P_state(S.S9,  S.S7)   = 1/3;
P_state(S.S9,  S.S8)   = 1/3;
% Final state S10 has no outgoing transitions in Eq. (12) matrix form.

nonTerminal = [S.S1, S.S23, S.ST45, S.S6, S.S7, S.S8, S.S9];
rowSumsState = sum(P_state(nonTerminal, :), 2);
assert(all(abs(rowSumsState - 1.0) < 1e-12), 'State transition rows must sum to 1.');

%% 7) Eq. (9): build one-step successful-transition matrix Q'
% Rule 2 (Type 1): caller -> responder, S(i,j) = P(i,j)
% Rule 3 (Types 2..7): otherwise, S(i,j) = R_i * P(i,j)
%
% In this banking model, callers are C6/C7/C8 and responder is C9.
requesterComponents = [6 7 8];
responderComponents = 9;
isRequesterState = false(nStates, 1);
isResponderState = false(nStates, 1);

for s = 1:nStates
    comps = stateComps{s};
    isRequesterState(s) = any(ismember(comps, requesterComponents));
    isResponderState(s) = any(ismember(comps, responderComponents));
end

type1 = (isRequesterState * isResponderState.') & (P_state > 0);

Q_prime = zeros(nStates, nStates);
for i = 1:nStates
    for j = 1:nStates
        if P_state(i,j) <= 0
            continue;
        end
        if type1(i,j)
            Q_prime(i,j) = P_state(i,j);           % Rule 2
        else
            Q_prime(i,j) = R_state(i) * P_state(i,j); % Rule 3
        end
    end
end

%% 8) Eq. (12): final system reliability at absorbing end state
% RS = (-1)^(m+1) * R_m^+ * |E'| / |I - Q'|
m = nStates;
A = eye(m) - Q_prime;
E_prime = A(1:end-1, 2:end); % remove last row, first column

den = det(A);
if abs(den) < 1e-14
    error('det(I - Q'') is numerically zero; Eq. (12) is not solvable.');
end

R_end = R_state(S.S10);
R_system = ((-1)^(m + 1)) * R_end * det(E_prime) / den;

% Cross-check: absorbing probability to S10 times end-state reliability.
Q_t = Q_prime(1:end-1, 1:end-1);
b_t = Q_prime(1:end-1, end);
reach_end = (eye(m-1) - Q_t) \ b_t;
R_system_check = R_end * reach_end(1);

%% Report
fprintf('=== Component Influence (Eq. 1-4) ===\n');
fprintf('Comp   E(mu)      InF         InP         lambda\n');
for i = 1:nComp
    fprintf('%-4s  %8.6f  %10.6f  %10.6f  %10.6f\n', ...
        componentNames{i}, E_mu(i), InF(i), InP(i), lambda(i));
end

fprintf('\n=== State Reliabilities (Eq. 5/6/7) ===\n');
for s = 1:nStates
    fprintf('%-5s %-15s R = %.10f\n', stateNames{s}, stateTypes{s}, R_state(s));
end

fprintf('\n=== Final System Reliability (Eq. 12) ===\n');
fprintf('R_system (Eq. 12)       = %.10f\n', R_system);
fprintf('R_system (cross-check)  = %.10f\n', R_system_check);
fprintf('Settings: alpha1=%.2f, alpha2=%.2f, selfInfluenceMode=%s\n', ...
    alpha1, alpha2, selfInfluenceMode);