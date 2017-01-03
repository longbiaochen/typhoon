% history based detection method
%% INIT
clc;clear;close all;
% boundaries: degree
LNGOFFSET = -0.01155; LATOFFSET = -0.00320;
NORTH = (24.561240 + LATOFFSET)*1e6;
EAST = (118.202504 + LNGOFFSET)*1e6;
WEST = (118.068150 + LNGOFFSET)*1e6;
SOUTH = (24.423417 + LATOFFSET)*1e6;
% distances: meter
GRID = 100;
WIDTH = 13587;
HEIGHT = 15325;
% times: second
DURATION = 600;
START_TIME = posixtime(datetime('09/01/2016 00:00','TimeZone','local','InputFormat','MM/dd/uuuu HH:mm')); 
END_TIME = posixtime(datetime('09/30/2016 23:59','TimeZone','local','InputFormat','MM/dd/uuuu HH:mm'));
% consts
Nt = 30*24*60*60/DURATION;
Nw = ceil(WIDTH/GRID);
Nh = ceil(HEIGHT/GRID);

% Nw = (EAST - WEST)*GRID/WIDTH
% Nh = (NORTH - SOUTH)*GRID/HEIGHT

%%
clc;
conn = sqlite('../data/taxi.db','readonly');
tic;
x = [];
y = [];
TS = zeros(Nh,Nw,Nt); % TRAFFIC SNAPSHOT
t = 1; cnt = 1;
for timestamp = START_TIME:DURATION:END_TIME
    query = sprintf('SELECT * FROM trajectory INDEXED BY indexes WHERE timestamp BETWEEN %d AND %d AND latitude BETWEEN %d AND %d AND longitude BETWEEN %d AND %d',...
            timestamp, timestamp + DURATION - 1,SOUTH,NORTH,WEST,EAST);
    results = fetch(conn,query);
    for i = 1:size(results,1)
        w = ceil(double(results{i,5} - WEST)/(EAST - WEST)*Nw);
        h = ceil(double(NORTH - results{i,4})/(NORTH - SOUTH)*Nh);
        TS(h,w,t) = TS(h,w,t) + 1;
    end
    t = t + 1;
    break;
end
toc;

%%
ts = squeeze(TS(:,:,1));
imagesc(ts);

