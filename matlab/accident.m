%%
clear;clc;close all;
load('accident201609');

% boundaries: degree * 1e6
T = 24.561485;
B = 24.423250;
R = 118.198504;
L = 118.064743;
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
SS = zeros(Nh,Nw,Nt); % SLOW SNAPSHOT
tb = T - B; rl = R - L;

for i = 1:height(accident201609)
    t = posixtime(datetime(accident201609.time(i),'TimeZone','local','InputFormat','yyyy/M/d HH:mm:ss')); 
    tid = fix((t - START_TIME)/DURATION) + 1;
    hid = fix((T - accident201609.latitude(i)) * Nh / tb);
    wid = fix((accident201609.longitude(i) - L) * Nw / rl);
    break
end



%%
for t = 1:Nt
    tic;
    timestamp = START_TIME + (t-1) * DURATION;
    rows = accident_table_201609(accident_table_201609.time >= timestamp & accident_table_201609.time < timestamp + DURATION,:);
    break;
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