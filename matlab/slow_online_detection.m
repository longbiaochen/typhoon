%% INIT
clc;clear;close all;
% boundaries: degree * 1e6
T = 24561485;
B = 24423250;
R = 118198504;
L = 118064743;
tb = T - B;
rl = R - L;
% distances: meter
GRID = 100;
WE = 13550;
NS = 15388;
% times: second
DURATION = 60*30;
START_TIME = posixtime(datetime('09/01/2016 00:00','TimeZone','local','InputFormat','MM/dd/uuuu HH:mm')); 
END_TIME = posixtime(datetime('09/30/2016 23:59','TimeZone','local','InputFormat','MM/dd/uuuu HH:mm'));
% consts
Nt = 30*24*60*60/DURATION;
Nts = 2*24*10+1;        Nte = 2*24*17;
Nw = ceil(WE/GRID);
Nh = ceil(NS/GRID);


%% rpca on RSS
load('SS');
load('RSS');
load('RID');
SS = SS(:,:,Nts:Nte);
RSS = RSS(:,Nts:Nte);

tic;
[RSSA,RSSE] = inexact_alm_rpca(RSS,2e-1);
toc;

mfigure();
subplot(1,3,1);
imagesc(RSS); colorbar();
subplot(1,3,2);
imagesc(RSSA); colorbar();
subplot(1,3,3);
imagesc(RSSE); colorbar();


%% from RSSE to SSE
SSE = zeros(Nh,Nw,Nte-Nts+1);
for t = 1:Nte-Nts+1
    sse = zeros(Nh,Nw);
    sse(RID) = RSSE(:,t);
    SSE(:,:,t) = sse;
end


%% Inspection on RSSE
hid = 85; wid = 53;
mfigure();

ss = squeeze(SS(hid,wid,:));
subplot(2,1,1);
plot(ss);
ax = gca;
xlim([1,30*24*2]);
ax.XTick = 1:24*2:30*24*2;
ax.XTickLabel = 1:30;
grid on;

sse = squeeze(SSE(hid,wid,:));
subplot(2,1,2);
plot(sse);
ax = gca;
xlim([1,30*24*2]);
ax.XTick = 1:24*2:30*24*2;
ax.XTickLabel = 1:30;
grid on;
