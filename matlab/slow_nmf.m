
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


%%
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


%% robust nmf: alternating minimization
clc;close all;tic;
MAX_ITERS = 9; k = 6; 
l1 = 5e-1; l2 = 5e-1;
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
        
        minimize(norm(X - D*S - E,'fro') + l1*norm(D,'fro') + l1*norm(S,'fro') + l2*norm(E,0))
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
imagesc(E); colorbar();

subplot(2,3,4);
imagesc(X); colorbar();
subplot(2,3,5);
imagesc(D*S); colorbar();
subplot(2,3,6);
imagesc(X - D*S - E); colorbar();
