import pandas as pd
from sklearn.cluster import KMeans, AgglomerativeClustering, DBSCAN, OPTICS, Birch
from sklearn import svm
from sklearn.neighbors import KNeighborsClassifier, NearestNeighbors
# from sklearn.preprocessing import StandardScaler, Imputer
from sklearn.metrics import silhouette_score, confusion_matrix, accuracy_score
#from sklearn.decomposition import PCA
from sklearn.neighbors import KNeighborsClassifier
from sklearn import tree
from sklearn.model_selection import cross_val_predict
from sklearn.exceptions import DataConversionWarning
import warnings
import math
import numpy as np
import json
import os
from . import c50RuleSets
from mdlp.discretization import MDLP
from sklearn.model_selection import train_test_split

#since we only user one csv file, we simply use df to each different machine learning
df = pd.read_csv('dataset/rounded_fairness_metrics_results.csv', header=0)
dfWithoutID=df.loc[:, ~df.columns.isin(['id'])]

def kmeans(k, selectedids):
    """
    Assumes "dataset parameter" is numpy array, clusters using k-means,
    auto-selects k by calculating average silhouette score,
    returns labels for k silhouette score closest to 1
    """
    # k-means clustering is a method of vector quantization, the attribute should not chontain any string
    warnings.simplefilter('always', DataConversionWarning)
    #errorMsg = ''
    mlResult = None
    with warnings.catch_warnings(record=True) as w:
        try:
            selectedDF = dfWithoutID

            #print("selectedids", selectedids)
            #print("len(selectedids)", len(selectedids))

            if len(selectedids) > 0:
                selectedDF = selectedDF.take(selectedids)
            kmeansModel = KMeans(n_clusters=k,random_state=4).fit(selectedDF)
            rawResult = kmeansModel.labels_.tolist()
            # print(rawResult)
            #print("rawResult", rawResult)
            #print("len(rawResult)", len(rawResult))

            if len(selectedids) > 0:
                mlResult = []
                for i in range(len(dfWithoutID)):
                    mlResult.append(-1)
                for i, val in enumerate(rawResult):
                    mlResult[selectedids[i]] = val
            else:
                mlResult = rawResult

            #print("mlResult", mlResult)
            #print("len(mlResult)", len(mlResult))

            # print("selectedids", selectedids)
            # print("rawResult",rawResult)
            # print("mlResult",mlResult)
        except ValueError as ex:
            errorMsg = ex
            pass
    return mlResult

def hac(k, selectedids):
    warnings.simplefilter('always', DataConversionWarning)
    #errorMsg = ''
    mlResult = None
    with warnings.catch_warnings(record=True) as w:
        try:
            selectedDF = dfWithoutID
            if len(selectedids) > 0:
                selectedDF = selectedDF.take(selectedids)
            model = AgglomerativeClustering(n_clusters=k).fit(selectedDF)
            rawResult = model.labels_.tolist()
            
            if len(selectedids) > 0:
                mlResult = []
                for val in rawResult:
                    mlResult.append(selectedids[val])
            else:
                mlResult = rawResult

        except ValueError as ex:
            errorMsg = ex
            pass
    return mlResult

def dbscan(k, selectedids):
    warnings.simplefilter('always', DataConversionWarning)
    #errorMsg = ''
    mlResult = None
    with warnings.catch_warnings(record=True) as w:
        try:
            selectedDF = dfWithoutID
            if len(selectedids) > 0:
                selectedDF = selectedDF.take(selectedids)
            model = DBSCAN(min_samples=k).fit(selectedDF)
            rawResult = model.labels_.tolist()
            
            if len(selectedids) > 0:
                mlResult = []
                for val in rawResult:
                    mlResult.append(selectedids[val])
            else:
                mlResult = rawResult

        except ValueError as ex:
            errorMsg = ex
            pass
    return mlResult

def optics(k, selectedids):
    warnings.simplefilter('always', DataConversionWarning)
    #errorMsg = ''
    mlResult = None
    with warnings.catch_warnings(record=True) as w:
        try:
            selectedDF = dfWithoutID
            if len(selectedids) > 0:
                selectedDF = selectedDF.take(selectedids)
            model = OPTICS(min_samples=k).fit(selectedDF)
            rawResult = model.labels_.tolist()
            
            if len(selectedids) > 0:
                mlResult = []
                for val in rawResult:
                    mlResult.append(selectedids[val])
            else:
                mlResult = rawResult

        except ValueError as ex:
            errorMsg = ex
            pass
    return mlResult

def birch(k, selectedids):
    warnings.simplefilter('always', DataConversionWarning)
    #errorMsg = ''
    mlResult = None
    with warnings.catch_warnings(record=True) as w:
        try:
            selectedDF = dfWithoutID
            if len(selectedids) > 0:
                selectedDF = selectedDF.take(selectedids)
            
            #print("selectedDF", selectedDF)
            model = Birch(n_clusters=k).fit(selectedDF)
            rawResult = model.labels_.tolist()
            
            if len(selectedids) > 0:
                mlResult = []
                for val in rawResult:
                    mlResult.append(selectedids[val])
            else:
                mlResult = rawResult

        except ValueError as ex:
            errorMsg = ex
            pass
    return mlResult


def silhouette_samples(labels):
    try:
        return silhouette_score(dfWithoutID, labels)
    except ValueError as ex:
        return 0

def scalableBayesianRuleList(dataset, selectedIndexList,learningType):
    allMatchedIds=[]
    mlResult={"unselectedMatchedId":None,"selectedButNotMatched":None,"eachRules":None,"msg":"null"}
    
    if selectedIndexList!=None:
        if learningType=="learnRules":
            x = dataset.data
            y=[]
            for i in range(len(dataset.data)):
                if i in selectedIndexList:
                    y.append(1)
                else:
                    y.append(0)
            y=np.array(y)
            #for testing with random labels
            #y=np.random.randint(2, size=len(dataset.data))
            feature_names = dataset.feature_names
        elif learningType=="evaluation":
            x=dataset.values
            y=np.array(selectedIndexList)
            feature_names = dataset.columns
        x_train, x_test, y_train, y_test = train_test_split(
            x, y, test_size=0.33, random_state=42)
        discretizer = MDLP(random_state=42).fit(x_train, y_train)
        x_train_cat = discretizer.transform(x_train)
        category_names = compute_intervals(discretizer)
        rule_list = pysbrl.BayesianRuleList(seed=1, feature_names=feature_names, category_names=category_names, verbose=2)
        raw_rules=rule_list.fit(x_train_cat, y_train)
        if len(raw_rules)>0:
            x_test_cat = discretizer.transform(x_test)
            # used def __str__(self) of BayesianRuleList class to print this object
            #print(rule_list)
            formattedMlResults = rule_list.formatted_result()
            #print(formattedMlResults)
            #print(rule_list)
            #print('acc: %.4f' % rule_list.score(x_test_cat, y_test))
            dfData = pd.DataFrame(data=x)  
            # unselectedMatchedId=None
            # selectedButNotMatched=None
            # for formattedMlResult in formattedMlResults:
            #     #Todo:pred_label condition needs to be changed later! because right now we only have two classes: 1 is the selected group; 0 is the unselected;
            #     if formattedMlResult["default"]!=True:
            #         featureIndices=formattedMlResult["featureIds"]
            #         featureRanges=formattedMlResult["categories"] 
            #         #print("formattedMlResult feature ids",formattedMlResult["featureIds"], "range", formattedMlResult["categories"],"pred_label",formattedMlResult["pred_label"])
            #         for i in range(len(featureIndices)):
            #             print("featureIndices i",featureRanges[i])
            #             condition=True
            #             featureRange=featureRanges[i]
            #             featureRange=featureRange.replace('(', '').replace(')', '').split(',')
            #             #condition=(dfData[featureIndices[i]])
            #             if featureRange[0]=='-inf':
            #                 condition=condition & (dfData[featureIndices[i]]<float(featureRange[1]))
            #             elif featureRange[1]=='inf':
            #                 condition=condition &(dfData[featureIndices[i]]>float(featureRange[0]))
            #             else:
            #                 condition=condition &(dfData[featureIndices[i]]>float(featureRange[0]))&(dfData[featureIndices[i]]<float(featureRange[1]))
            #         ruleListIds=dfData.index[condition].values.tolist()
            #         #we have matched ids for each rule
            #         formattedMlResult["matchedIds"]=ruleListIds
            #         #concatenate and remove duplicate ones
            #         #print("selectedIndexList",selectedIndexList)
            #         #only put the matched label=1 ones into allMatchedIds
            #         if formattedMlResult["pred_label"]==1:
            #             #allMatchedIds empty at the begining, so we are adding the ids from learned rules “ruleListIds”
            #             allMatchedIds=list(set(allMatchedIds)|set(ruleListIds))
            #             #print("allMatchedIds",allMatchedIds)
            #         selectedButNotMatched=[x for x in selectedIndexList if x not in allMatchedIds]
            #         unselectedMatchedId=[x for x in allMatchedIds if x not in selectedIndexList]
            #         formattedMlResult["confidence"]=max(formattedMlResult["pred"])
            #     else:
            #         formattedMlResult["matchedIds"]=[x for x in dfData.index if x not in allMatchedIds]                        
            # if unselectedMatchedId!=None:
            #     mlResult["unselectedMatchedId"]=unselectedMatchedId
            # if selectedButNotMatched!=None:
            #     mlResult["selectedButNotMatched"]=selectedButNotMatched
            mlResult["eachRules"]=formattedMlResults
        else:
            mlResult["msg"]="Please select more data for learning the rule!"
    # print("all matched ids",allMatchedIds)
    # print("all unselectedMatchedId",unselectedMatchedId)
    # print("all selectedButNotMatched",selectedButNotMatched)
        #mlResult={"unselectedMatchedId":unselectedMatchedId,"eachRules":formattedMlResults}

    return mlResult
def treeRuleSets(dataset, selectedIndexList,learningType):
    #there are two learning types: "learnRules" and "evaluation"
    mlResult={"unselectedMatchedId":None,"selectedButNotMatched":None,"eachRules":None,"msg":"null"}
    if learningType=="learnRules":
        x = dataset
        y=[]
        print(selectedIndexList)
        for i in range(len(dataset)):
            if i in selectedIndexList:
                y.append(1)
            else:
                y.append(0)
        y=np.array(y)
        # print("+++++++",len(x),len(y))
        mlResult["eachRules"]=c50RuleSets.formatTreeRulesToMlResult(x,y)
    elif learningType=="evaluation":
        x = dataset
        y=np.array(selectedIndexList)
        mlResult["eachRules"]=c50RuleSets.formatTreeRulesToMlResult(x,y)
    #print (mlResult)
    return mlResult
def compute_intervals(mdlp_discretizer):
    category_names = []
    for i, cut_points in enumerate(mdlp_discretizer.cut_points_):
        idxs = np.arange(len(cut_points) + 1)
        names = mdlp_discretizer.assign_intervals(idxs, i)
        category_names.append(names)
    return category_names