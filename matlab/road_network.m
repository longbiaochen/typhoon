%% extract road network based on historical traffic intensity
clc;clear;close all;
load('TS');

ts1 = squeeze(mean(TS,3));
m = mean(ts1(:));
ts1(ts1<m) = 0;
nnz(ts1)
imagesc(ts1); colorbar();

RID = (ts1 > m);
save('RID','RID');

