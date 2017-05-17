%% INIT
clc;clear;close all;
% distances: meter
GRID = 100;
WE = 13550;
NS = 15388;
% consts
Nw = ceil(WE/GRID);
Nh = ceil(NS/GRID);
FN = '../images/Xiamen_Level_17.tif';


%% test input image
dim = [(j-1)*X/Nw,(i-1)*Y/Nh,Pw,Ph];
            patch = insertObjectAnnotation(img,'rectangle',dim,{'test'},...
                    'TextBoxOpacity',0.9,'FontSize',18);
            imshow(patch);

%%
clc;tic;
load('RID');
img = imread(FN);
INFO = imfinfo(FN);
Y = INFO.Height;
X = INFO.Width;
imshow(FN,'Reduce',true,'InitialMagnification','fit');


%%
clc;
Nr = nnz(RID);
Pw = fix(X/Nw);     Ph = fix(Y/Nh);
RP = cell(Nr,1);
cnt = 1;
for w = 1:Nw
    for h = 1:Nh
        if RID(h,w) > 0   
            patch = img((h-1)*Y/Nh:h*Y/Nh,(w-1)*X/Nw:w*X/Nw,:);
            fn = sprintf('../patches/%d_%d.tif',h,w)
            imwrite(patch,fn);
        end
    end
end


%%




