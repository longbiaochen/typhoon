%%
clear;clc;close all;

m = 32; n = 32; k = 4;
D0 = rand(m,k); S0 = rand(k,n);
X0 = D0*S0;
X = X0;
X(21:22,5:6) = 4;

imagesc(X); colorbar();


%% rpca
[A,E] = inexact_alm_rpca(X,2e-1);
disp([rank(A), rank(X)]);
mfigure();
subplot(2,3,1);
imagesc(X); colorbar();
subplot(2,3,2);
imagesc(A); colorbar();
subplot(2,3,3);
imagesc(E); colorbar();

subplot(2,3,4);
imagesc(X0); colorbar();
subplot(2,3,5);
imagesc(X0-A); colorbar();
subplot(2,3,6);
imagesc(X-A); colorbar();



%% simple nmf
clc;close all;tic;
MAX_ITERS = 8; k = 5; 
l1 = 5e-3;
m = size(X,1); n = size(X,2);
D = rand(m,k); S = rand(k,n);
for iter = 1:MAX_ITERS
    cvx_begin quiet
        if mod(iter,2) == 1
            variable S(k,n) nonnegative
        elseif mod(iter,2) == 0
            variable D(m,k) nonnegative
        end   
        minimize(norm(X - D*S,'fro') + l1*norm(D,'fro') + l1*norm(S,'fro'))
    cvx_end
    fprintf(1,'Iteration %d, residual norm %g\n',iter,cvx_optval);
end
toc;
disp(norm(X - D*S, 'fro'));

mfigure();
subplot(2,3,1);
imagesc(D); colorbar();
subplot(2,3,2);
imagesc(S); colorbar();
subplot(2,3,3);
imagesc(X - D*S); colorbar();

subplot(2,3,4);
imagesc(X); colorbar();
subplot(2,3,5);
imagesc(D*S); colorbar();
subplot(2,3,6);
imagesc(abs(X - D*S)>10); colorbar();


%% alternating minimization
clc;close all;tic;
MAX_ITERS = 3^2; k = 4; 
l1 = 5e-1; l2 = 5e-3;
m = size(X,1); n = size(X,2);
D = rand(m,k); S = rand(k,n); E = rand(m,n);
for iter = 1:MAX_ITERS
    cvx_begin quiet
        if mod(iter,3) == 1
            variable S(k,n) nonnegative
        elseif mod(iter,3) == 2
            variable D(m,k) nonnegative
        else
            variable E(m,n) nonnegative
        end
        
        minimize(norm(X - D*S - E,'fro') + l1*norm(D,'fro') + l1*norm(S,'fro') + l2*norm(E,1))
    cvx_end
    fprintf(1,'Iteration %d, residual norm %g\n',iter,cvx_optval);
end
toc;
disp(norm(X0 - D*S, 'fro'));

mfigure();
subplot(2,3,1);
imagesc(D); colorbar();
subplot(2,3,2);
imagesc(S); colorbar();
subplot(2,3,3);
imagesc(E); colorbar();

subplot(2,3,4);
imagesc(X0); colorbar();
subplot(2,3,5);
imagesc(X); colorbar();
subplot(2,3,6);
imagesc(D*S); colorbar();



