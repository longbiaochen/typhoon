%% Load Images
% Instead of operating on all of Caltech 101, which is time consuming, use
% three of the categories: airplanes, ferry, and laptop. The image category
% classifier will be trained to distinguish amongst these six categories.
clc;clear;close all;

rootFolder = '/Users/Longbiao/Projects/typhoon/web/training';
categories = {'true', 'false'};

imds = imageDatastore(fullfile(rootFolder, categories), 'LabelSource', 'foldernames');

% Set the ImageDatastore ReadFcn
imds.ReadFcn = @(filename)readAndPreprocessImage(filename);

% The |imds| variable now contains the images and the category labels
% associated with each image. The labels are automatically assigned from
% the folder names of the image files. Use |countEachLabel| to summarize
% the number of images per category.
tbl = countEachLabel(imds)
% Because |imds| above contains an unequal number of images per category,
% let's first adjust it, so that the number of images in the training set
% is balanced.

% minSetCount = min(tbl{:,2}); % determine the smallest amount of images in a category

% Use splitEachLabel method to trim the set.
% imds = splitEachLabel(imds, minSetCount, 'randomize');

% Notice that each set now has exactly the same number of images.
% countEachLabel(imds)


%% Show examples
% Below, you can see example images from three of the categories included
% in the dataset.

% Find the first instance of an image for each category
true_sample = find(imds.Labels == 'true', 1);
false_sample = find(imds.Labels == 'false', 1);

figure
subplot(1,2,1);
imshow(readimage(imds,true_sample))
subplot(1,2,2);
imshow(readimage(imds,false_sample))


%% Load Pre-trained CNN
% The CNN model is saved in MatConvNet's format [3]. Load the MatConvNet
% network data into |convnet|, a |SeriesNetwork| object from Neural Network
% Toolbox(TM), using the helper function |helperImportMatConvNet|. A
% SeriesNetwork object can be used to inspect the network architecture,
% classify new data, and extract network activations from specific layers.

% Load MatConvNet network into a SeriesNetwork
cnnMatFile = '/Users/Longbiao/Projects/deep_models/imagenet-caffe-alex.mat';
convnet = helperImportMatConvNet(cnnMatFile)

% |convnet.Layers| defines the architecture of the CNN. 

% View the CNN architecture
convnet.Layers

% The first layer defines the input dimensions. Each CNN has a different
% input size requirements. The one used in this example requires image
% input that is 227-by-227-by-3.

% Inspect the first layer
convnet.Layers(1)

% The intermediate layers make up the bulk of the CNN. These are a series
% of convolutional layers, interspersed with rectified linear units (ReLU)
% and max-pooling layers [2]. Following the these layers are 3
% fully-connected layers.
%
% The final layer is the classification layer and its properties depend on
% the classification task. In this example, the CNN model that was loaded
% was trained to solve a 1000-way classification problem. Thus the
% classification layer has 1000 classes from the ImageNet dataset. 

% Inspect the last layer
convnet.Layers(end)

% Number of class names for ImageNet classification task
numel(convnet.Layers(end).ClassNames)

% Get the network weights for the second convolutional layer
w1 = convnet.Layers(2).Weights;

% Scale and resize the weights for visualization
w1 = mat2gray(w1);
w1 = imresize(w1,5); 

% Display a montage of network weights. There are 96 individual sets of
% weights in the first layer.
figure
montage(w1)
title('First convolutional layer weights')


%% Prepare Training and Test Image Sets
% Split the sets into training and validation data. Pick 30% of images
% from each set for the training data and the remainder, 70%, for the
% validation data. Randomize the split to avoid biasing the results. The
% training and test sets will be processed by the CNN model.

[~, testSet] = splitEachLabel(imds, .7, 'randomize');
trainingSet = imds;

%% Extract Training Features Using CNN
% Each layer of a CNN produces a response, or activation, to an input
% image. However, there are only a few layers within a CNN that are
% suitable for image feature extraction. The layers at the beginning of the
% network capture basic image features, such as edges and blobs. To see
% this, visualize the network filter weights from the first convolutional
% layer. This can help build up an intuition as to why the features
% extracted from CNNs work so well for image recognition tasks. Note that
% visualizing deeper layer weights is beyond the scope of this example. You
% can read more about that in the work of Zeiler and Fergus [4].

% Notice how the first layer of the network has learned filters for
% capturing blob and edge features. These "primitive" features are then
% processed by deeper network layers, which combine the early features to
% form higher level image features. These higher level features are better
% suited for recognition tasks because they combine all the primitive
% features into a richer image representation [5].
%
% You can easily extract features from one of the deeper layers using the
% |activations| method. Selecting which of the deep layers to choose is a
% design choice, but typically starting with the layer right before the
% classification layer is a good place to start. In |convnet|, the this
% layer is named 'fc7'. Let's extract training features using that layer.
clc;tic;
featureLayer = 'fc7';
trainingFeatures = activations(convnet, trainingSet, featureLayer, ...
    'MiniBatchSize', 32, 'OutputAs', 'columns');
toc;


%% Train A Multiclass SVM Classifier Using CNN Features
% Next, use the CNN image features to train a multiclass SVM classifier. A
% fast Stochastic Gradient Descent solver is used for training by setting
% the |fitcecoc| function's 'Learners' parameter to 'Linear'. This helps
% speed-up the training when working with high-dimensional CNN feature
% vectors, which each have a length of 4096.
clc;tic;
% Get training labels from the trainingSet
trainingLabels = trainingSet.Labels;

% Train multiclass SVM classifier using a fast linear solver, and set
% 'ObservationsIn' to 'columns' to match the arrangement used for training
% features.
classifier = fitcecoc(trainingFeatures, trainingLabels, ...
    'Learners', 'Linear', 'Coding', 'onevsall', 'ObservationsIn', 'columns');
toc;


%% Evaluate the Trained Classifier
% Repeat the procedure used earlier to extract image features from
% |testSet|. The test features can then be passed to the classifier to
% measure the accuracy of the trained classifier.
clc;tic;
% Extract test features using the CNN
testFeatures = activations(convnet, testSet, featureLayer, 'MiniBatchSize',32);

% Pass CNN image features to trained classifier
predictedLabels = predict(classifier, testFeatures);

% Get the known labels
testLabels = testSet.Labels;

% Tabulate the results using a confusion matrix.
confMat = confusionmat(testLabels, predictedLabels);

% Convert confusion matrix into percentage form
confMat = bsxfun(@rdivide,confMat,sum(confMat,2))
toc;

% Display the mean accuracy
mean(diag(confMat))


%% Try the Newly Trained Classifier on Test Images
% You can now apply the newly trained classifier to categorize new images.
clc;close all;
figure();
newImage = '/Users/Longbiao/Projects/typhoon/web/patches/9_41.tif';

% Pre-process the images as required for the CNN
img = readAndPreprocessImage(newImage);

% Extract image features using the CNN
imageFeatures = activations(convnet, img, featureLayer);

% Make a prediction using the classifier
imshow(newImage);
label = predict(classifier, imageFeatures)


%%
clc;close all;

listing = dir('/Users/Longbiao/Projects/typhoon/web/patches/');
for i = 1:length(listing)
    name = listing(i).name;
    folder = listing(i).folder;
    if strcmp(name,'.') || strcmp(name,'..')|| strcmp(name,'.DS_Store')
        continue
    end
    fn = [folder,'/',name];
    
    % Pre-process the images as required for the CNN
    img = readAndPreprocessImage(fn);

    % Extract image features using the CNN
    imageFeatures = activations(convnet, img, featureLayer);

    % Make a prediction using the classifier
    label = predict(classifier, imageFeatures);
    
    disp([name,': ',label]);
    
    if label == 'true'
        copyfile(fn,['/Users/Longbiao/Projects/typhoon/web/test/true/',name])

    elseif label == 'false'
        copyfile(fn,['/Users/Longbiao/Projects/typhoon/web/test/false/',name])
    end
end



