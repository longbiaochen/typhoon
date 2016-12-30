% history based detection method
%%
clc;clear;close all;
DURATION = 3600*24; % seconds
LNGOFFSET = -0.01155; LATOFFSET = -0.00320;
NE = [118.127983,24.485675]*1e6 + LNGOFFSET; 
SW = [118.127462,24.484886]*1e6 + LNGOFFSET;
START_TIME = posixtime(datetime('09/08/2016 10:00','InputFormat','MM/dd/uuuu HH:mm')); 
END_TIME = posixtime(datetime('09/22/2016 10:00','InputFormat','MM/dd/uuuu HH:mm'));


%%
conn = sqlite('../taxi.db','readonly');

for timestamp = START_TIME:DURATION:END_TIME
    query = sprintf('SELECT * FROM trajectory INDEXED BY indexes WHERE timestamp BETWEEN %d AND %d AND latitude BETWEEN %d AND %d AND longitude BETWEEN %d AND %d',...
            timestamp, timestamp + DURATION - 1, SW(2), NE(2), SW(1), NE(1))
    results = fetch(conn,query)
    break;
    
end
