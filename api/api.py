
import time
from flask import Flask
from flask import request
# from ...machine_learner import machineLearner as ml
from machine_learner import machineLearner as ml
from flask_cors import CORS, cross_origin
import pandas as pd
import re
import json
import numpy as np
from sklearn.preprocessing import MinMaxScaler
from sklearn.cluster import KMeans
from sklearn.manifold import MDS, TSNE
from sklearn.decomposition import PCA

app = Flask(__name__)
CORS(app)

@app.route('/time')
def get_current_time():
    return {'time': time.time()}

@app.route("/getTreeData", methods=["POST"])
def getTreeData():
    filename = 'data.csv'
    df = pd.read_csv(filename)
    df_for_tree = df.copy(deep=True)
    json_data = json.loads(request.get_data(as_text=True))
    rst = []
    for item in json_data:
        if len(item)>0:
            obj = []
            rows = df_for_tree.take(item)
            for i,r in rows.iterrows():
                row = r[1][1:-1]
                row = row.replace("'","")
                obj.append(row)
            rst.append(obj)
    return json.dumps(rst)

@app.route("/hightLightTree", methods=["POST"])
def hightLightTree():
    json_data = json.loads(request.get_data(as_text=True))
    id = json_data['id']
    filename = 'data.csv'
    df = pd.read_csv(filename)
    df_for_tree = df.copy(deep=True)
    rst = ''
    for index,row in df_for_tree.iterrows():
        val = row[1]
        val = val.replace('[','').replace(']','').replace('\'','')
        if id==index:
            rst = val
    return json.dumps(rst, ensure_ascii=False)

# @app.route("/hightLightTree", methods=["POST"])
# def hightLightTree():
#     json_data = json.loads(request.get_data(as_text=True))
#     id = json_data['highLight']
#     data = json_data['data']
#     filename = 'data.csv'
#     df = pd.read_csv(filename)
#     df_for_tree = df.copy(deep=True)
#     treeData = {}
#     for i in data:
#         a = data[i]
#         b = []
#         for item in a:
#             value = item["value"]
#             high = item["highLight"]
#             for index,row in df_for_tree.iterrows():
#                 val = row[1]
#                 val = val.replace('[','').replace(']','').replace('\'','')
#                 if val == value and id==index:
#                     #print(val, value, id, index)
#                     high = 1
#             obj = {
#                 'highLight':high,
#                 'value':value
#             }
#             b.append(obj)
#         treeData[i] = b
                    
#     return json.dumps({'data': treeData}, ensure_ascii=False)


@app.route("/getclusterResults", methods=["POST"])
def getclusterResults():
    passedInteractionsJson = request.get_json(force=True)
    k = passedInteractionsJson["k"]
    
    clusteringType = passedInteractionsJson.get("clusteringType","kmeans")
    selectedIds = passedInteractionsJson["selectedIds"]
    if len(selectedIds) == 0:
        selectedIds = [i for i in range(0, 100)]
    mlResult = []
    if clusteringType == "kmeans":
        mlResult = ml.kmeans(k, selectedIds)
    elif clusteringType == "hac":
        mlResult = ml.hac(k, selectedIds)
    # print(mlResult)
    dic = {}
    if mlResult == None:
        return {'sizes': [], 'groupIDs': []}
    else:
        for idx, group in enumerate(mlResult):
            if group in dic:
                dic[group].append(idx)
            else:
                dic[group] = [idx]

    keys = sorted(dic.keys())
    sizes = []
    groups = []
    for i in keys:
        if i < 0:
            continue
        sizes.append(len(dic[i]))
        groups.append(dic[i])

    return {'sizes': sizes, 'groupIDs': groups}
    # f = open('getclusterReslts_2sizes.json')
    # data = json.load(f)
    # return data

@app.route("/learnRules", methods=["POST"])
def getRules():
    passedInteractionsJson = request.get_json(force=True)
    dfDataX = pd.read_csv('dataset/rounded_fairness_metrics_results_2.csv', header=0)

    isNumericalDataOnly=0
    learningType = "learnRules"
    # session_id = request.args.get('sessionId')
    # parameters = json.loads(request.form['parameters'])
    # session_id = parameters["sessionId"]
    # selectX = parameters["selectX"]
    # selectY = parameters["selectY"]
    # colorAttribute=parameters["selectColor"]
    # params = request.get_json()
    # print("selectedDataset", params['selectedData'])
    # selectedIndexList = parameters["selectedIndexList"]
    selectedIndexList = passedInteractionsJson['selectedIds']
    # print("selectedIndexList", selectedIndexList)
    # dataset = SessionModel.fetch_session(session_id).dataset
    # temporary solution for switing c50 (True) or scalableBayesianRuleList
    useDecisionTree = True
    ruleMlResultV1 = None
    ruleMlResultV2 = None
    # root = Path(__file__).parent.parent.parent
    # folderPath = os.path.join(root, r'data_storage/' + session_id)
    # extension = 'csv'
    # os.chdir(folderPath)
    # filePath = glob.glob('*.{}'.format(extension))[0]
    # dfData = pd.read_csv(filePath)
    #dfData=DataSetModel.read_csv(filePath)
    # targetName = dataset.target_name
    # if targetName != None:
    #     dfDataX = dfData.loc[:, dfData.columns != targetName]
    # else:
    #     dfDataX = dfData
    # if colorAttribute!="":
    #     dfDataX=dfDataX.drop([colorAttribute],axis=1)
    
    # Get columns whose data type is not number
    # if isNumericalDataOnly==1:
    #     filteredColumns = dfDataX.dtypes[dfDataX.dtypes==object]
    #     listOfColumnNames = list(filteredColumns.index)
    #     datasetV1=dfDataX.drop(listOfColumnNames,axis=1)
    # else:
    #     datasetV1=dfDataX
    datasetV1=dfDataX
    # list of columns whose data type is not number
    
    
    datasetV1 = pd.DataFrame(data=datasetV1) 
    ruleMlResultV1 = ml.treeRuleSets(datasetV1, selectedIndexList, learningType)

    # if(useDecisionTree):
    #     # V1 is for when there is no x-axis or y-axis selected, we get all the rules
    #     ruleMlResultV1 = ml.treeRuleSets(datasetV1, selectedIndexList, learningType)
    #     #print("QuinlanruleMlResult", ruleMlResultV1)
    #     # V2 is for when there are x-axis and y-axis selected, we get the rules with attributes of x and y filtered.
    #     if selectX != None and selectY != None:
    #         datasetV2 = dfDataX.drop([selectX, selectY], axis=1)
    #         datasetV2 = pd.DataFrame(data=datasetV2)
    #         ruleMlResultV2 = ml.treeRuleSets(datasetV2, selectedIndexList, learningType)
    # else:
    #     # V1 is for when there is no selected x-axis or y-axis, we get all the atributes
    #     datasetV1 = DataSetModel(None)
    #     datasetV1.data=dfDataX.values
    #     datasetV1.feature_names = dfDataX.columns.values
    #     ruleMlResultV1 = ml.scalableBayesianRuleList(datasetV1, selectedIndexList,learningType)
    #     #print("SBRL ruleMlResult v1", ruleMlResultV1)
    #     # V2 is for when there are x-axis and y-axis selected, we get the rules filtered with attributes of x and y.
    #     if selectX != None and selectY != None:
    #         dfDataXV2 = dfDataX.drop([selectX, selectY], axis=1)
    #         datasetV2 = DataSetModel(None)
    #         datasetV2.data = dfDataXV2.values
    #         datasetV2.feature_names = dfDataXV2.columns.values
    #         ruleMlResultV2 = ml.scalableBayesianRuleList(datasetV2, selectedIndexList,learningType)
    #         #print("SBRL ruleMlResult v2", ruleMlResultV2)
    if ruleMlResultV1 is not None:
        ruleMlResultV1=handleOppositeRules(ruleMlResultV1)
        ruleMlResultV1=handleRuleMatchedIdsCount(ruleMlResultV1,datasetV1,selectedIndexList)
        ruleMlResultV1=handleRuleOrder(ruleMlResultV1)
    # if ruleMlResultV2 is not None:
    #     ruleMlResultV2=handleOppositeRules(ruleMlResultV2)
    #     ruleMlResultV2=handleRuleMatchedIdsCount(ruleMlResultV2,datasetV2,selectedIndexList)
    #     ruleMlResultV2=handleRuleOrder(ruleMlResultV2)
    # print("ruleMlResultV2",ruleMlResultV2)
    ajax_response = {"status": 0, "ml_result_std": ruleMlResultV1, "Error": None}
    if ruleMlResultV1 is not None:
        ajax_response["status"] = 1
        # ajax_response["ml_result"] = ruleList
    else:
        ajax_response["Error"] = "to do: need to handle different error msg"
    # return jsonify(ajax_response)
    return ajax_response

def handleRuleOrder(ruleMlResult):
    #newlist = sorted(list_to_be_sorted, key=lambda k: k['name']) 
    if ruleMlResult["eachRules"] is not None:
        ruleMlResult["eachRules"]=sorted(ruleMlResult["eachRules"],key=lambda k:(-k['matchedIdsCount'],k['pred_label']))

    #sortedRuleMlResult=sorted(ruleMlResult["eachRules"],key=lambda k:k['matchedIdsCount'],reverse=True)
    return ruleMlResult

def handleRuleMatchedIdsCount(formattedMlResults,dfData,selectedIndexList):
    selectedIndicesSet=set(selectedIndexList)
    unselectedIndicesSet=set(set(dfData.index.tolist())-selectedIndicesSet)
    if formattedMlResults["eachRules"] is not None:
        for formattedMlResult in formattedMlResults["eachRules"]:
        #Todo:pred_label condition needs to be changed later! because right now we only have two classes: 1 is the selected group; 0 is the unselected;
            if formattedMlResult["default"]!=True:
                featureNames=formattedMlResult["featureName"]
                featureRanges=formattedMlResult["categories"] 
                ruleLabel=formattedMlResult["pred_label"] 
                #print("formattedMlResult feature ids",formattedMlResult["featureIds"], "range", formattedMlResult["categories"],"pred_label",formattedMlResult["pred_label"])
                #for i in range(len(featureIndices)):
                for i in range(len(featureNames)):
                    #print("featureIndices i",featureRanges[i])
                    condition=True
                    featureRange=featureRanges[i]
                    if featureRange.startswith("(-inf") and featureRange.endswith(")"):
                        featureRange=featureRange.replace('(', '').replace(')', '').split(',')
                    #condition=(dfData[featureIndices[i]])
                    #if featureRange[0]=='-inf':
                        condition=condition & (dfData[featureNames[i]]<float(featureRange[1]))
                    elif featureRange.startswith("(-inf") and featureRange.endswith("]"):
                        featureRange=featureRange.replace('(', '').replace(']', '').split(',')
                        condition=condition & (dfData[featureNames[i]]<=float(featureRange[1]))
                    elif featureRange.startswith("(") and featureRange.endswith("inf)"):
                        featureRange=featureRange.replace('(', '').replace(')', '').split(',')
                        condition=condition &(dfData[featureNames[i]]>float(featureRange[0]))
                    elif featureRange.startswith("[") and featureRange.endswith("inf)"):
                        featureRange=featureRange.replace('[', '').replace(')', '').split(',')
                        condition=condition &(dfData[featureNames[i]]>=float(featureRange[0]))
                    elif featureRange.startswith("(") and featureRange.endswith(")"):
                        featureRange=featureRange.replace('(', '').replace(')', '').split(',')
                        condition=condition &(dfData[featureNames[i]]>float(featureRange[0]))&(dfData[featureNames[i]]<float(featureRange[1]))
                    elif featureRange.startswith("(") and featureRange.endswith("]"):
                        featureRange=featureRange.replace('(', '').replace(']', '').split(',')
                        condition=condition &(dfData[featureNames[i]]>float(featureRange[0]))&(dfData[featureNames[i]]<=float(featureRange[1]))
                    elif featureRange.startswith("[") and featureRange.endswith(")"):
                        featureRange=featureRange.replace('[', '').replace(')', '').split(',')
                        condition=condition &(dfData[featureNames[i]]>=float(featureRange[0]))&(dfData[featureNames[i]]<float(featureRange[1]))
                    elif featureRange.startswith("[") and featureRange.endswith("]"):
                        featureRange=featureRange.replace('[', '').replace(']', '').split(',')
                        if dfData[featureNames[i]].dtype==object:
                            #todo: do not hardcoded to "yes" or "no"
                            condition=condition &((dfData[featureNames[i]]=='yes').astype(int)>=float(featureRange[0]))&((dfData[featureNames[i]]=='yes').astype(int)<=float(featureRange[1]))
                        else:
                            condition=condition &(dfData[featureNames[i]]>=float(featureRange[0]))&(dfData[featureNames[i]]<=float(featureRange[1]))
                    elif featureRange.startswith("{") and featureRange.endswith("}"):
                        positiveConditions = featureRange[1:-1] # "{1,2,3}" remove {} to become "1,2,3"
                        positiveConditions = positiveConditions.split(',')   # "1,2,3" become ["1","2","3"]

                        listConditions = pd.Series(list(map(lambda each: each in positiveConditions, dfData[featureNames[i]])))
                        condition = condition & listConditions
                    else:
                        conditionVal = featureRange.replace('\\',"")
                        condition=condition &(dfData[featureNames[i]]==conditionVal)
                        

                ruleListIdsSet=set(dfData.index[condition].values.tolist())
                #we have matched ids for each rule
                ruleMatchedIdsSet=set()
                if ruleLabel==0:
                    #0 means it predict the nodes should be negative
                    ruleMatchedIdsSet=unselectedIndicesSet&ruleListIdsSet
                else:
                    ruleMatchedIdsSet=selectedIndicesSet&ruleListIdsSet
                formattedMlResult["matchedIdsCount"]=len(ruleMatchedIdsSet)
        #     #concatenate and remove duplicate ones
        #     #print("selectedIndexList",selectedIndexList)
        #     #only put the matched label=1 ones into allMatchedIds
        #     if formattedMlResult["pred_label"]==1:
        #         #allMatchedIds empty at the begining, so we are adding the ids from learned rules “ruleListIds”
        #         allMatchedIds=list(set(allMatchedIds)|set(ruleListIds))
        #         #print("allMatchedIds",allMatchedIds)
        #     selectedButNotMatched=[x for x in selectedIndexList if x not in allMatchedIds]
        #     unselectedMatchedId=[x for x in allMatchedIds if x not in selectedIndexList]
        #     formattedMlResult["confidence"]=max(formattedMlResult["pred"])
        # else:
        #     formattedMlResult["matchedIds"]=[x for x in dfData.index if x not in allMatchedIds]                        
    # if unselectedMatchedId!=None:
    #     mlResult["unselectedMatchedId"]=unselectedMatchedId
    # if selectedButNotMatched!=None:
    #     mlResult["selectedButNotMatched"]=selectedButNotMatched
    return formattedMlResults

def handleOppositeRules(ruleMlResult):
    removeRuleIndices=[]
    if ruleMlResult["eachRules"] is not None:
        for ruleId in range(len(ruleMlResult["eachRules"])):
            if ruleMlResult["eachRules"][ruleId]["pred_label"]==1:
                rangeArray=ruleMlResult["eachRules"][ruleId]["categories"]
                featureNameArray=ruleMlResult["eachRules"][ruleId]["featureName"]
                checkOppositeRangeDic={}
                for i in range(len(rangeArray)):

                    if featureNameArray[i] not in checkOppositeRangeDic:
                        checkOppositeRangeDic[featureNameArray[i]]=[]

                    rangeWithSplittedBrackets=re.match('(\[|\()(.*?)(\]|\))',rangeArray[i])
                    if rangeWithSplittedBrackets is None:
                        rangeVal = rangeArray[i].replace(" ","").replace("\\","")
                        if '{' in rangeVal and '}' in rangeVal:
                            checkOppositeRangeDic[featureNameArray[i]].append(rangeVal)
                            continue
                        if len(rangeVal.split(",")) == 1:
                            checkOppositeRangeDic[featureNameArray[i]].append("["+rangeVal+","+rangeVal+"]")
                            continue


                    splittedRangeContent=rangeWithSplittedBrackets[2].replace(" ","").split(",")
                    
                    if splittedRangeContent[0]=="-inf":
                        if rangeWithSplittedBrackets[3]==")":
                            checkOppositeRangeDic[featureNameArray[i]].append("["+splittedRangeContent[1]+",inf)")
                        else:
                            checkOppositeRangeDic[featureNameArray[i]].append("("+splittedRangeContent[1]+",inf)")                   
                    elif splittedRangeContent[1]=="inf":
                        if rangeWithSplittedBrackets[1]=="(":
                            checkOppositeRangeDic[featureNameArray[i]].append("(-inf,"+splittedRangeContent[0]+"]")
                        else:
                            checkOppositeRangeDic[featureNameArray[i]].append("(-inf,"+splittedRangeContent[0]+")")
                    else:
                        if rangeWithSplittedBrackets[1]=="(":
                            checkOppositeRangeDic[featureNameArray[i]].append("(-inf,"+splittedRangeContent[0]+"]")
                        else:
                            checkOppositeRangeDic[featureNameArray[i]].append("(-inf,"+splittedRangeContent[0]+")")
                        if rangeWithSplittedBrackets[3]==")":
                            checkOppositeRangeDic[featureNameArray[i]].append("["+splittedRangeContent[1]+",inf)")
                        else:
                            checkOppositeRangeDic[featureNameArray[i]].append("("+splittedRangeContent[1]+",inf)")
                
                #handle opposit rules:
                for oppositeRuleId in range(len(ruleMlResult["eachRules"])):
                    if ruleMlResult["eachRules"][oppositeRuleId]["pred_label"]==0:
                        oppositeFeatureNameArray=ruleMlResult["eachRules"][oppositeRuleId]["featureName"]
                        oppositeRangeArray=ruleMlResult["eachRules"][oppositeRuleId]["categories"]
                        isMatch=True
                        for j in range(len(oppositeFeatureNameArray)):
                            if oppositeFeatureNameArray[j] in [*checkOppositeRangeDic]:
                                if oppositeRangeArray[j].replace(" ","") not in checkOppositeRangeDic[oppositeFeatureNameArray[j]]:
                                    isMatch=False
                                else:
                                    checkOppositeRangeDic[oppositeFeatureNameArray[j]].remove(oppositeRangeArray[j].replace(" ",""))
                                    if (len(checkOppositeRangeDic[oppositeFeatureNameArray[j]])==0):
                                        checkOppositeRangeDic.pop(oppositeFeatureNameArray[j], None)
                            else:
                                isMatch=False
                        #check if the dictionary is empty
                        if isMatch and bool(checkOppositeRangeDic)==False:
                            removeRuleIndices.append(int(oppositeRuleId))
        if len(removeRuleIndices)>0:
            #print("removeRuleIndices",removeRuleIndices)
            removeRuleIndices.sort(reverse = True)
            #print("removeRuleIndices",removeRuleIndices)
            for k in removeRuleIndices:
                ruleMlResult["eachRules"].pop(k)
    return ruleMlResult


# @app.route('/step1', methods=['GET','POST'])
# def getStep1Data():
#     data = json.loads(request.get_data(as_text=True))
#     names = []
#     rst = []
#     for d in data:
#         name = d
#         name = name.replace("-","")
#         names.append(name)
#     df = pd.read_csv('data.csv')
#     for i,r in df.iterrows():
#         row = r[1][1:-1]
#         row = row.replace("'","")
#         arr = row.split(',')
#         for k in arr:
#             if k.strip() in names:
#                 obj = {
#                     'id':r[0],
#                     'acc':r[2],
#                     'precision':r[3],
#                     'recall':r[4],
#                     'statistical':r[5],
#                     'equal':r[6],
#                     'disparate':r[7],
#                     'error':r[8]
#                 }
#                 rst.append(obj)
#     # return json.dump(rst)
#     return json.dumps(rst,ensure_ascii=False)

def checkNameExist(arr, names):
    for k in names:
        if k.strip() in arr:
            return True
    return False

@app.route('/step1', methods=['GET','POST'])
def getStep1Data():
    data = json.loads(request.get_data(as_text=True))
    names = []
    rst = []
    for d in data:
        name = d
        name = name.replace("-","")
        names.append(name)
    df = pd.read_csv('data.csv')
    for i,r in df.iterrows():
        row = r[1][1:-1]
        row = row.replace("'","")
        arr = row.split(',')
        flag = True
        for k in arr:
            if k.strip() in names:
                flag = True
        if flag:
            obj = {
                'id':r[0],
                'acc':r[2],
                'precision':r[3],
                'recall':r[4],
                'statistical':r[5],
                'equal':r[6],
                'disparate':r[7],
                'error':r[8],
                'row':row
            }
            rst.append(obj)
    return json.dumps(rst,ensure_ascii=False)

def getChildren(origin, arr):
    newdict = origin
    if len(arr)==1:
        obj = {
            'name':arr[0],
            'children':[]
        }
        newdict = dict(origin, **obj)
    return newdict
### update by linx at 2023-01-08
def checkHighLight(a,b,c,d,e,f,data):
    rst = 0
    for item in data:
        if len(item)==0:
            return 0
        if item['acc']==a and item['precision']==b and item['recall']==c and item['statistical']==d and item['equal']==e and item['disparate']==f:
            rst = 1
    return rst

def changeFormat(item):
    obj = []
    if item is not None and len(item)>0: 
        obj.append(item['acc'])
        obj.append(item['precision'])
        obj.append(item['recall'])
        obj.append(item['statistical'])
        obj.append(item['equal'])
        obj.append(item['disparate'])
        obj.append(item['error'])
    return obj

## update by linx
@cross_origin()
@app.route("/passInteractions", methods=["POST"])
def passInteractions():
    if request.method == 'POST':
        param = request.get_json()
        ids = param['ids']
        r1 = passInteractionsCall(False, ids)
        r2 = passInteractionsCall(True, ids)
        return json.dumps({'clusters': r1[0],'treeData': r1[1],'centers': r1[2]}, ensure_ascii=False)
        # return json.dumps({'clusters': r2[0],'treeData': r2[1],'centers': r2[2]}, ensure_ascii=False)
        # r1 = passInteractionsCall(False, ids)
        # # r2 = passInteractionsCall(True, ids)
        # return json.dumps({'clusters': r1[0],'treeData': r1[1],'centers': r1[2]}, ensure_ascii=False)

def passInteractionsCall(dropErrorRate, param):
    filename = 'data.csv' ### rounded_fairness_metrics_results.csv
    p = json.loads(request.get_data(as_text=True))
    k = int(p['clusters'])
    highLights = p['highLight']
    #highLights = changeFormat(p['highLight'])
    df = pd.read_csv(filename)
    df = df.drop('Unnamed: 0', 1)
    if dropErrorRate:
        df = df.drop(['error_rate_ratio'],1)
    df_for_tree = df.copy(deep=True)  # the dataframe used for section 6
    df = df.drop('id', 1)       # get ride of the id column
    features = list(df.columns)
    data = df[features]
    data = (data-data.min())/(data.max()-data.min())
    clustering_kmeans = KMeans(n_clusters=k, random_state = 4) ### select
    data['clusters'] = clustering_kmeans.fit_predict(data)  # mapping each data row to different clusters
    centers = KMeans(n_clusters=k, random_state = 4).fit(data).cluster_centers_
    extracted_col = data["clusters"]
    df_for_tree = df_for_tree.join(extracted_col)

    cluster = np.zeros(k)
    for i,r in df_for_tree.iterrows():
        index = int(r[7])
        cluster[index] = int(cluster[index]) + 1

    treeData = {}
    for i, r in df_for_tree.iterrows():
        if i in param:
            index = int(r[7])
            ids = r[0].replace('[','').replace(']','').replace("'",'')
            if index not in treeData.keys():
                empty = []
            else:
                empty = treeData[index]
            hightLight = 0 ## checkHighLight(r[1],r[2],r[3],r[4],r[5],r[6],highLights)
            obj = {
                'highLight':hightLight,
                'value':ids
            }
            empty.append(obj)
            treeData[index] = empty
    # print("++++++",treeData, cluster.tolist())
    return [cluster.tolist(), treeData, centers.tolist()]
    # return json.dumps({'clusters': cluster.tolist(),'treeData':treeData,'centers':centers.tolist()}, ensure_ascii=False)

def standardizeData(df):
    #df = df.drop('Unnamed: 0', 1)
    # if dropErrorRate:
    #     df = df.drop(['error_rate_ratio'],1)
    #df_for_tree = df.copy(deep=True)  # the dataframe used for section 6
    #df = df.drop('id', 1)       # get ride of the id column
    df_id=df['id']
    df = df.drop('id', 1)
    features = list(df.columns)
    data = df[features]
    data = (data-data.min())/(data.max()-data.min())
    data['id']=df_id
    return data

def checkString(a, b):
    rst = True
    arr = a.split(',')
    asize = len(arr)
    brr = b.split(',')
    bsize = len(brr)
    if asize == bsize:
        for i in range(asize):
            if arr[i].strip()!=brr[i].strip():
                rst = False
    else:
        rst = False
    return rst

# @app.route('/step6', methods=['GET','POST'])
# def getStep6():
#     signatureId = json.loads(request.get_data(as_text=True))['data']
#     filename = 'data.csv' ### rounded_fairness_metrics_results.csv
#     df = pd.read_csv(filename)
#     df = df.drop('Unnamed: 0', 1)
    
#     data=standardizeData(df)
#     #dat = df[features]
#     rst = []
#     #acc,precision,recall,statistical_parity_difference,equal_opportunity_difference,disparate_impact,error_rate_ratio
#     # for i in range(len(df)) :
#     #     print(df.loc[i, "Name"], df.loc[i, "Age"])
#     for i in range(len(data)):
#         if(checkString(data.loc[i, "id"], signatureId)):
#             rst.append(data.loc[i,'acc'])
#             rst.append(data.loc[i,'precision'])
#             rst.append(data.loc[i,'recall'])
#             rst.append(data.loc[i,'statistical_parity_difference'])
#             rst.append(data.loc[i,'equal_opportunity_difference'])
#             rst.append(data.loc[i,'disparate_impact'])
#             rst.append(data.loc[i,'error_rate_ratio'])
#     return json.dumps(rst, ensure_ascii=False)
def getArrTrip(data):
    arr = []
    for item in data:
        arr.append(item.strip())
    return arr

@app.route('/step6', methods=['GET','POST'])
def getStep6():
    signatureId = json.loads(request.get_data(as_text=True))['data']
    rst = ()
    filename = 'data.csv'
    df = pd.read_csv(filename)
    for i,r in df.iterrows():
        row = r[1][1:-1]
        row = row.replace("'","")
        arr = row.split(',')
        arr = getArrTrip(arr)
        target = '-'.join(arr)
        if target == signatureId:
            rst = (r[2],r[3],r[4],r[5],r[6],r[7],r[8])

    return json.dumps(rst, ensure_ascii=False)

@app.route('/project_pca', methods=['POST', 'GET'])
def projectPCA():
    # param = request.get_json(force=True)
    # selectedIds = [int(item) for item in param['ids']]

    filename = 'data.csv'
    df = pd.read_csv(filename)
    # df = df[df['Unnamed: 0'].isin(selectedIds)]
    df = df.drop('Unnamed: 0', 1)
    

    dataset = standardizeData(df)
    dataset = dataset.drop('id', 1)
    dataset = dataset.values

    n_components = 2
    pca = PCA(n_components)
    position = pca.fit(dataset).transform(dataset)

    result_position = []
    for i in range(len(position)):
        row = {"x": position[i][0], "y": position[i][1], "id": i}
        result_position.append(row)

    return json.dumps({'projection': result_position}, ensure_ascii=False)

@app.route('/project_mds', methods=['POST', 'GET'])
def projectMDS():
    # param = request.get_json(force=True)
    # selectedIds = [int(item) for item in param['ids']]

    filename = 'data.csv'
    df = pd.read_csv(filename)
    # df = df[df['Unnamed: 0'].isin(selectedIds)]
    df = df.drop('Unnamed: 0', 1)
    

    dataset = standardizeData(df)
    dataset = dataset.drop('id', 1)
    dataset = dataset.values

    n_components = 2
    metric = True
    n_init = 4
    max_iter = 300
    verbose = 0
    eps = 1e-3
    n_jobs = 1
    random_state = None
    dissimilarity = "euclidean"

    mds = MDS(n_components=n_components, metric=metric, n_init=n_init,
              max_iter=max_iter, verbose=verbose, eps=eps, n_jobs=n_jobs,
              random_state=None, dissimilarity=dissimilarity)
    scaler = MinMaxScaler()
     
    dataset = scaler.fit_transform(dataset)
    position = mds.fit_transform(dataset)
    position = position.tolist()

    result_position = []
    for i in range(len(position)):
        row = {"x": position[i][0], "y": position[i][1], "id": i}
        result_position.append(row)

    return json.dumps({'projection': result_position}, ensure_ascii=False)

@app.route('/project_tsne', methods=['POST', 'GET'])
def projectTSNE():
    # param = request.get_json(force=True)
    # selectedIds = [int(item) for item in param['ids']]

    filename = 'data.csv'
    df = pd.read_csv(filename)
    # df = df[df['Unnamed: 0'].isin(selectedIds)]
    df = df.drop('Unnamed: 0', 1)
    

    dataset = standardizeData(df)
    dataset = dataset.drop('id', 1)
    dataset = dataset.values

    tsne=TSNE(n_components=2, random_state=0)
    position = tsne.fit_transform(dataset)
    position = position.tolist()

    result_position = []
    for i in range(len(position)):
        row = {"x": position[i][0], "y": position[i][1], "id": i}
        result_position.append(row)

    return json.dumps({'projection': result_position}, ensure_ascii=False)
    
@app.route('/clustersrate', methods=['POST'])
def clustersrate():
    passedInteractionsJson = request.get_json(force=True)
    selectedIds = passedInteractionsJson["selectedIds"]
    #print("clustersrate > selectedIds", selectedIds, len(selectedIds))
    if len(selectedIds) == 0:
        selectedIds = [i for i in range(0, 100)]
    kmeans = {}
    for i in range(2, 7):
        kmeans[i] = ml.silhouette_samples(ml.kmeans(i, selectedIds))
    hac = {}
    for i in range(2, 7):
        hac[i] = ml.silhouette_samples(ml.hac(i, selectedIds))
    dbscan = {}
    for i in range(2, 7):
        dbscan[i] = ml.silhouette_samples(ml.dbscan(i, selectedIds))
    optics = {}
    for i in range(2, 7):
        optics[i] = ml.silhouette_samples(ml.optics(i, selectedIds))
    birch = {}
    for i in range(2, 7):
        birch[i] = ml.silhouette_samples(ml.birch(i, selectedIds))
    return json.dumps({ "kmeans": kmeans, "hac": hac, "dbscan": dbscan, "optics": optics, "birch": birch })
    # f = open('clustersrate.json')
    # data = json.load(f)
    # return data

if __name__=="__main__":
    app.run(host="0.0.0.0", port=14324)
