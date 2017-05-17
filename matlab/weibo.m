%%
clc;
t = loadjson('t.json');
t = t.statuses;


%%
clc;
for i = 1:length(t)
    item = t{1,i};
    fprintf('%s\t[%f,%f]\t%d\t%s\n',item.created_at,item.geo.coordinates{1},item.geo.coordinates{2},item.distance,item.text);
end