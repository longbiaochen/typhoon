%%
clc;clear;close all;
load('RS');

%%
m = size(RS,1); n = size(RS,2); k = 4;
% A = randn(m,k); B = randn(m,k); S = randn(m,n);
T = RS;
cvx_begin
    variable A(m,k) nonnegative
    variable B(m,k) nonnegative
    variable S(m,n) nonnegative
    minimize( norm(T - A * B' - S,'fro') )
    subject to
        norm_nuc(S) <= e
cvx_end