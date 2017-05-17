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
Nw = ceil(WE/GRID);
Nh = ceil(NS/GRID);


%% extract slow snapshot SS
clc;tic;

conn = sqlite('../data/behavior.db','readonly');
SS = zeros(Nh,Nw,Nt); % SLOW SNAPSHOT
for t = 1:Nt
    tic;
    timestamp = START_TIME + (t-1) * DURATION;
    query = sprintf('SELECT * FROM slow INDEXED BY indexes WHERE timestamp BETWEEN %d AND %d AND latitude BETWEEN %d AND %d AND longitude BETWEEN %d AND %d',...
            timestamp, timestamp + DURATION - 1,B,T,L,R);
    results = cell2mat(fetch(conn,query));
    hid = (T - results(:,4)) * Nh / tb;
    wid = (results(:,5) - L) * Nw / rl;
    cnt = 0;
    for i = 1:size(results,1)
        try
            SS(hid(i),wid(i),t) = SS(hid(i),wid(i),t) + 1;
        catch
            cnt = cnt + 1;
        end
    end
    disp([t,i,cnt,toc]);
end
toc;

save('SS','SS');


%% from TS/SS to RTS/RSS
load('TS');
load('SS');
load('RID');
Nr = nnz(RID);          Nt = size(TS,3);
RTS = zeros(Nr,Nt);     RSS = zeros(Nr,Nt);
for t = 1:Nt
    ts = TS(:,:,t);     ss = SS(:,:,t);
    RTS(:,t) = ts(RID); RSS(:,t) = ss(RID);
end
save('RTS','RTS');
save('RSS','RSS');

mfigure();
subplot(1,2,1);
imagesc(RTS); colorbar();
subplot(1,2,2);
imagesc(RSS); colorbar();


%% some day on RSS
CURRENT_TIME = posixtime(datetime('09/15/2016 10:30','TimeZone','local','InputFormat','MM/dd/uuuu HH:mm')); 
t = (CURRENT_TIME - START_TIME)/DURATION + 1;
M = zeros(Nh,Nw);
M(RID) = RSS(:,t);
surf(M); colorbar();


%% rpca on RTS and RSS
clc;
load('RTS');    load('RSS');
tic;
[RTSA,RTSE] = inexact_alm_rpca(RTS,1e-1);
[RSSA,RSSE] = inexact_alm_rpca(RSS,2e-1);
toc;

mfigure();
subplot(2,3,1);
imagesc(RTS); colorbar();
subplot(2,3,2);
imagesc(RTSA); colorbar();
subplot(2,3,3);
imagesc(RTSE); colorbar();
subplot(2,3,4);
imagesc(RSS); colorbar();
subplot(2,3,5);
imagesc(RSSA); colorbar();
subplot(2,3,6);
imagesc(RSSE); colorbar();

save('RTSA','RTSA');  save('RTSE','RTSE');
save('RSSA','RSSA');  save('RSSE','RSSE');


%% observe RSSE
r = sum(RSSE,1);
plot(r);
ax = gca;
xlim([1,30*24*2]);
ax.XTick = 1:24*2:30*24*2;
ax.XTickLabel = 1:30;
grid on;


%% from RTSE/RSSE to TSE/SSE
load('RID');
TSE = zeros(Nh,Nw,Nt);      SSE = zeros(Nh,Nw,Nt);
for t = 1:Nt
    tse = zeros(Nh,Nw);     sse = zeros(Nh,Nw);
    tse(RID) = RTSE(:,t);   sse(RID) = RSSE(:,t);
    TSE(:,:,t) = tse;       SSE(:,:,t) = sse;
end
save('TSE','TSE');
save('SSE','SSE');


%% RTSE vs RSSE
load('TS');     load('SS');
load('TSE');    load('SSE');


%%
hid = 94; wid = 9;
mfigure();

ts = squeeze(TS(hid,wid,:));
subplot(4,1,1);
plot(ts);
ax = gca;
xlim([1,30*24*2]);
ax.XTick = 1:24*2:30*24*2;
ax.XTickLabel = 1:30;
grid on;

tse = squeeze(TSE(hid,wid,:));
subplot(4,1,2);
plot(tse);
ax = gca;
xlim([1,30*24*2]);
ax.XTick = 1:24*2:30*24*2;
ax.XTickLabel = 1:30;
grid on;

ss = squeeze(SS(hid,wid,:));
subplot(4,1,3);
plot(ss);
ax = gca;
xlim([1,30*24*2]);
ax.XTick = 1:24*2:30*24*2;
ax.XTickLabel = 1:30;
grid on;

sse = squeeze(SSE(hid,wid,:));
subplot(4,1,4);
plot(sse);
ax = gca;
xlim([1,30*24*2]);
ax.XTick = 1:24*2:30*24*2;
ax.XTickLabel = 1:30;
grid on;


%% export to carto
clc;tic;
load('SSE');
Ne = nnz(SSE);
slow_errors = cell(Ne,4);

cnt = 1;
for hid = 1:Nh
    for wid = 1:Nw
        for tid = 1:Nt
            if SSE(hid,wid,tid) > 0
                lat = (T - hid*tb/Nh + tb/Nh/2)/1e6;
                lng = (wid*rl/Nw + L + rl/Nw/2)/1e6;
                t = START_TIME + (tid-1) * DURATION; 
                dt = datestr(datetime(t, 'ConvertFrom', 'posixtime','TimeZone','local'));
                slow_errors(cnt,:) = {lat,lng,dt,SSE(hid,wid,tid)};
                cnt = cnt + 1;
            end
        end
    end
end
toc;

fid = fopen('../web/slow_errors.csv','wt');
fprintf(fid,'latitude,longitude,datetime,value\n');
for k=1:size(slow_errors,1)
    fprintf(fid,'%f,%f,%s,%f\n',slow_errors{k,:});
end
fclose(fid);


