% history based detection method: hello world
%% INIT
clc;clear;close all;
% boundaries: degree * 1e6
T = 24561485;
B = 24423250;
R = 118198504;
L = 118064743;
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


%%
clc;
tic;
TS = zeros(Nh,Nw,Nt); % TRAFFIC SNAPSHOT
tb = T - B;
rl = R - L;
parfor t = 1:Nt
    tic;
    timestamp = START_TIME + (t-1) * DURATION;
    conn = sqlite('../data/taxi.db','readonly');
    query = sprintf('SELECT * FROM trajectory INDEXED BY indexes WHERE timestamp BETWEEN %d AND %d AND latitude BETWEEN %d AND %d AND longitude BETWEEN %d AND %d',...
            timestamp, timestamp + DURATION - 1,B,T,L,R);
    results = cell2mat(fetch(conn,query));
    ts = zeros(Nh,Nw);
    vid = results(:,1);
    hid = (T - results(:,4)) * Nh / tb;
    wid = (results(:,5) - L) * Nw / rl;
    for h = 1:Nh
        for w = 1:Nw
            ts(h,w) = numel(unique(vid(hid==h & wid==w)));            
        end
    end
    TS(:,:,t) = ts;
    disp([t,toc]);
end
toc;
save('TS','TS');


%%
load('TS');


%%
figure();
for t = 1:Nt
    ts = squeeze(TS(:,:,t));
    imagesc(ts);
    colorbar();
    pause;
end

%%
a = squeeze(sum(sum(TS,1),2));
bar(a)

%%
figure();
b = squeeze(TS(73,89,:));
plot(b);
ax = gca;
xlim([1,30*24*2]);
ax.XTick = 1:24*2:30*24*2;
ax.XTickLabel = 1:30;
grid on;

%%
histogram(TS(:));
set(gca,'yscale','log') 
