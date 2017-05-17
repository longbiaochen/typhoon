%%
clc;clear;close all;
load('A');
load('RID');
Nr = nnz(RID);
Nt = size(A,2);
Nh = size(RID,1);
Nw = size(RID,2);


%% nonnegative
clc;
R = 5;
T = fmt(A);
model = struct;
model.variables.A = randn(Nr, R);
model.variables.B = randn(Nt, R);
model.factors.A = {'A', @struct_nonneg};
model.factors.B = {'B', @struct_nonneg};
model.factorizations.slow.data = T;
model.factorizations.slow.cpd = {'A', 'B'};

sdf_check(model, 'print');

options.Display = 50;
options.TolFun = 1e-10;
options.MaxIter = 1000;
[sol, output] = sdf_nls(model, options);
disp([output.abserr,output.relerr]);


%%
close all;clc;
mfigure();
for r = 1:R
    title(r);
    
    Mr = zeros(Nh,Nw);
    Mr(RID) = sol.factors.A(:,r);
    subplot(1,2,1);
    imagesc(Mr); colorbar();
    title('Region (100m * 100m)');
    
    subplot(1,2,2);
    Mt = reshape(sol.factors.B(:,r),48,30);
    imagesc(Mt); colorbar();
    title('Time (30min)');
    
    pause;
end

%% residual
RShat = sol.factors.A * sol.factors.B';
mfigure();
subplot(1,2,1);
imagesc(RS);
subplot(1,2,2);
imagesc(RS-RShat);

