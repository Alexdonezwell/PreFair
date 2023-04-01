import rpy2.robjects as robjects
from rpy2.robjects import pandas2ri
import pandas as pd
import re


def handleStoredResult(eachMlResult, storedConditions, dfData):
    condition = True
    if eachMlResult["featureName"] == None and eachMlResult["categories"] == None and eachMlResult["featureIds"] == None:
        eachMlResult["featureName"] = []
        eachMlResult["categories"] = []
        eachMlResult["featureIds"] = []
    for keyValue in storedConditions.keys():
        print(storedConditions)
        eachMlResult["featureName"].append(keyValue)
        eachMlResult["featureIds"].append(
            dfData.columns.get_loc(keyValue))
        if len(storedConditions[keyValue]) > 1:
            if float(storedConditions[keyValue][0][0]) <= float(storedConditions[keyValue][1][0]):
                featureRange = (float(storedConditions[keyValue][0][0]),float(storedConditions[keyValue][1][0]))
                condition = condition & (dfData[keyValue] > float(storedConditions[keyValue][0][0])) & (
                    dfData[keyValue] < float(storedConditions[keyValue][1][0]))
            # else:
            #     featureRange = (float(storedConditions[keyValue][1][0]),float(storedConditions[keyValue][0][0]))
            #     condition = condition & (dfData[keyValue] >float(storedConditions[keyValue][0][0])) & (
            #         dfData[keyValue] < float(storedConditions[keyValue][1][0]))
        elif len(storedConditions[keyValue]) == 1:
            if(type(storedConditions[keyValue][0]) == str):
                featureRange = storedConditions[keyValue][0]
                if '{' in storedConditions[keyValue][0] and '}' in storedConditions[keyValue][0]:
                    positiveConditions = storedConditions[keyValue][0][1:-1] # "{1,2,3}" remove {} to become "1,2,3"
                    positiveConditions = positiveConditions.split(',')   # "1,2,3" become ["1","2","3"]

                    listConditions = pd.Series(list(map(lambda each: each in positiveConditions, dfData[keyValue])))
                    condition = condition & listConditions
                else:
                    condition = condition & (dfData[keyValue] == storedConditions[keyValue][0])
            else:
                if storedConditions[keyValue][0][1] == "<":
                    featureRange = (-float('inf'),float(storedConditions[keyValue][0][0]))
                    condition = condition & (dfData[keyValue] < float(storedConditions[keyValue][0][0]))
                elif storedConditions[keyValue][0][1] == ">":
                    featureRange = (float(storedConditions[keyValue][0][0]),float('inf'))
                    condition = condition & (dfData[keyValue] > float(storedConditions[keyValue][0][0]))
        eachMlResult["categories"].append(str(featureRange))
        matchedIds = dfData.index[condition].values.tolist()
        eachMlResult["matchedIds"] = matchedIds
        eachMlResult["default"]=False
    return eachMlResult


def formatTreeRulesToMlResult(x, y):
    pandas2ri.activate()
    # df = pd.read_csv(
    #     '/Users/carolinecao/Documents/research/ruleProject/dataset/wine.csv')
    # y = df.loc[:, "class"]
    # x = df.loc[:, df.columns != 'class']

    # df = pandas2ri.conversion.py2rpy(df)
    convertedX = pandas2ri.conversion.py2rpy(x)
    convertedY = pandas2ri.conversion.py2rpy(y)

    robjects.r('''
            f <- function(xData,yData) {
                        library(C50)
                        yData<-as.factor(yData)
                        str(yData)
                        c50_model <- C5.0(x = xData, y = yData, rules = TRUE)
                        return (c50_model)
                }
                ''')

    r_f = robjects.globalenv['f']
    c50_model = r_f(convertedX, convertedY)

    modelNamesDic = dict(zip(c50_model.names, list(c50_model)))
    #print("modelNamesDic['output']",modelNamesDic['output'])
    splittedRuleInfo = modelNamesDic["rules"][0].split("\n")
    outputArray = modelNamesDic['output'][0].split("\n")
    confidenceArray = []
    for outputStr in outputArray:
        if '->' in outputStr:
            confidenceArray.append(re.findall(r'\[([^]]*)\]', outputStr)[0])
    mlResult = []
    rule_count = 0
    conds_last = 0
    cover_last = 0
    ok_last = 0
    lift_last = 0
    class_last = 0
    ruleNum = -1
    storedConditions = None
    # eachMlResult={'ruleType':"numerical","featureName":None,"featureIds":None,"categories":None,"matchedIds":None,"pred":None,"default":False,"pred_label":None}
    initial = True
    combineAttributeRange = False
    for lineString in splittedRuleInfo:
        if lineString[0:5] == "rules":
            # print(lineString)
            conditionLine = lineString.split(" ")
            ruleItem = conditionLine[0].split("=")
            ruleNum = ruleItem[1].replace('"', "")
            #print("ruleNum", ruleNum)
        if lineString[0:5] == "conds" or lineString[0:4] == "type":
            if lineString[0:5] == "conds":
                conditionCount = 0
                # here we know that all the condition has been looped under that rule, where we can handle/format result
                if initial == False:
                    handledEachMlResult = handleStoredResult(
                        eachMlResult, storedConditions, x)
                    #print ("eachMlResult",eachMlResult)
                    mlResult.append(handledEachMlResult)
                eachMlResult = {"featureName": None, "featureIds": None, "categories": None,
                                "matchedIds": None, "pred": None, "confidence": None, "default": False, "pred_label": None}
                initial = False
                # featureName = []
                featureIds = []
                storedConditions = {}
                rule_count += 1
                conditionLine = lineString.split(" ")
                # print("conditionLine",conditionLine)
                condsItem = conditionLine[0].split("=")
                conds_last = condsItem[1].replace('"', "")
                # print("conds_last",conds_last)
                # cover is the number of training cases covered by the rule
                coverItem = conditionLine[1].split("=")
                cover_last = coverItem[1].replace('"', "")
                # print("cover_last",cover_last)
                # ok is the number of positives covered by class,
                okItem = conditionLine[2].split("=")
                ok_last = okItem[1].replace('"', "")
                # print("ok_last",cover_last)
                # lift is the estimated accuracy of the rule
                liftItem = conditionLine[3].split("=")
                lift_last = liftItem[1].replace('"', "")
                # print("lift_last",lift_last)
                # class predicted by
                classItem = conditionLine[4].split("=")
                class_last = classItem[1].replace('"', "")
                eachMlResult["pred_label"] = int(class_last)
                # print("class_last",class_last)
            if lineString[0:4] == "type":
                conditionCount += 1
                # variable type
                # print(lineString)
                conditionLine = lineString.split(" ")
                # print("conditionLine",conditionLine)
                typeItem = conditionLine[0].split("=")
                type_last = typeItem[1].replace('"', "")
                # print("type_last",type_last)
                attributeNameItem = conditionLine[1].split("=")
                attributeName_last = attributeNameItem[1].replace('"', "")
                # print("attributeName_last",attributeName_last)
                # featureName.append(attributeName_last)
                # featureIds.append(x.columns.get_loc(attributeName_last))
                if lineString[0:8] == 'type="1"':
                    #print("lineString", lineString)
                    # lineString type="1" att="Int.l.Plan" val="no"
                    if lineString.count("val"):
                        valItem = conditionLine[2].split("=")
                        val_last = valItem[1].replace("\\","").replace('"', "")
                        #print("val", val_last)
                        if attributeName_last not in storedConditions:
                            storedConditions[attributeName_last] = []
                        storedConditions[attributeName_last].append(val_last)
                if lineString[0:8] == 'type="2"':
                    # eachMlResult["featureName"]=featureName
                    # sniff out optional parameters
                    elts_last = ""
                    if lineString.count("elts"):
                        eltsItem = conditionLine[2].split("=")
                        elts_last = eltsItem[1].replace('"', "")
                        #print("elts_last", elts_last)
                    cut_last = ""
                    if lineString.count("cut"):
                        cutItem = conditionLine[2].split("=")
                        cut_last = cutItem[1].replace('"', "")
                        # print("cut_last",cut_last)
                    if lineString.count("result"):
                        resultItem = conditionLine[3].split('"')
                        result_last = resultItem[1]
                        # print("result_last",result_last)
                    if attributeName_last not in storedConditions:
                        storedConditions[attributeName_last] = []
                    storedConditions[attributeName_last].append([cut_last, result_last])

                if lineString[0:8] == 'type="3"':
                    elts_last = ""
                    if lineString.count("elts"):
                        eltsItem = conditionLine[2].split("=")
                        elts_last = eltsItem[1].replace('\\"','')
                        #print("elts_last", elts_last)
                        # print("result_last",result_last)
                    if attributeName_last not in storedConditions:
                        storedConditions[attributeName_last] = []
                    storedConditions[attributeName_last].append("{" + elts_last + "}")

        #         print ("ruleNum",ruleNum,"rule_count",rule_count)
        #         
        #  ("conditionCount",conditionCount,"conds_last",conds_last)
            if int(ruleNum) == int(rule_count) and int(conditionCount) == int(conds_last):
                # print(storedConditions)
                handledEachMlResult = handleStoredResult(
                    eachMlResult, storedConditions, x)
                #print ("eachMlResult",eachMlResult)
                mlResult.append(handledEachMlResult)
    if len(confidenceArray) > 0:
        for i in range(len(confidenceArray)):
            mlResult[i]["confidence"] = confidenceArray[i]
    mlResult=fixC50MlResult(mlResult,modelNamesDic["output"][0].split("\n\n"))
    return mlResult

def fixC50MlResult(mlResult, outputRules):
    """
    Example mlResult:
            [{
                'featureName': ['statistical_parity_difference'],
                'featureIds': [3],
                'categories': ['(-inf, -0.093000002)'],
                'matchedIds': [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 26, 28, 29, 30, 31, 34, 35, 37, 40, 41, 42, 43, 46, 47, 48, 49, 54, 61, 63, 65, 71, 72, 74, 75, 77, 84, 94, 96],
                'pred': None,
                'confidence': '0.981',
                'default': False,
                'pred_label': 0
            }, {
                'featureName': ['statistical_parity_difference', 'equal_opportunity_difference'],
                'featureIds': [3, 4],
                'categories': ['(-0.07, inf)', '(-0.090999998, inf)'],
                'matchedIds': [27, 32, 33, 38, 44, 50, 56, 57, 58, 59, 64, 66, 68, 69, 73, 79, 81, 83, 85, 88, 90, 91, 97],
                'pred': None,
                'confidence': '0.960',
                'default': False,
                'pred_label': 0
            }, {
                'featureName': ['statistical_parity_difference', 'equal_opportunity_difference'],
                'featureIds': [3, 4],
                'categories': ['(-0.093000002, inf)', '(-inf, -0.090999998)'],
                'matchedIds': [12, 36, 39, 45, 52, 53, 55, 67, 70, 76, 78, 80, 82, 86, 87, 89, 92, 93, 98, 99],
                'pred': None,
                'confidence': '0.955',
                'default': False,
                'pred_label': 1
            }, {
                'featureName': ['statistical_parity_difference'],
                'featureIds': [3],
                'categories': ['(-0.093000002, -0.07)'],
                'matchedIds': [12, 23, 24, 25, 36, 45, 51, 52, 55, 60, 62, 67, 70, 76, 78, 80, 87, 89, 92, 95, 98],
                'pred': None,
                'confidence': '0.913',
                'default': False,
                'pred_label': 1
            }]

    Example outputRules:
            C5.0 [Release 2.07 GPL Edition]  	Thu Mar  2 23:25:49 2023 -------------------------------
            Class specified by attribute `outcome'
            Read 100 cases (8 attributes) from undefined.data
            Rules:
            Rule 1: (51, lift 1.3)	statistical_parity_difference <= -0.093	->  class 0  [0.981]
            Rule 2: (23, lift 1.3)	statistical_parity_difference > -0.07	equal_opportunity_difference > -0.091	->  class 0  [0.960]
            Rule 3: (20, lift 3.8)	statistical_parity_difference > -0.093	equal_opportunity_difference <= -0.091	->  class 1  [0.955]
            Rule 4: (21/1, lift 3.7)	statistical_parity_difference > -0.093	statistical_parity_difference <= -0.07	->  class 1  [0.913]
            Default class: 0
            Evaluation on training data (100 cases):
                        Rules     	  ----------------	    No      Errors
                    4    1( 1.0%)   <<
                (a)   (b)    <-classified as	  ----  ----	    74     1    (a): class 0	          25    (b): class 1 
                Attribute usage:
                100.00%	statistical_parity_difference	 43.00%	equal_opportunity_difference Time: 0.0 secs
    """
    print ("mlResult",mlResult)
    print ("outputRules",outputRules)
    j = 0 # j is index of mlResult that match current outputRule
    startReading = False

    for index in range(len(outputRules)):
        if "Rules:" in outputRules[index]:
            startReading = True
            continue
        
        if startReading == False or not ("Rule " in outputRules[index]) or j >= len(mlResult):
            continue

        print("outputRules[index]", index, outputRules[index])
        print("mlResult[j]", j, mlResult[j])

        conditionsArray=outputRules[index].split('\n')
        print("conditionsArray: ", j, conditionsArray)
        
        #handle same featureName
        
        tmpList = []
        for line in conditionsArray:
            if line.endswith('}') and not '{' in line and len(tmpList) > 0:
                tmpList[-1] = tmpList[-1] + line.replace(" ", "") 
            else:
                tmpList.append(line)


        conditionsArray = tmpList
        # isFirst=True
        # featureNames=[]
        mlIndex=0
        featureNames=[]
        isFirst=True
        for conditionIndex in range(len(conditionsArray)):
            print("conditionIndex", conditionIndex)
            print("conditionsArray[conditionIndex]", conditionsArray[conditionIndex])

            if " < " in conditionsArray[conditionIndex] or " <= " in conditionsArray[conditionIndex] or " = " in conditionsArray[conditionIndex] or " > " in conditionsArray[conditionIndex] or " >= " in conditionsArray[conditionIndex]:

                if mlResult[j]["featureName"][mlIndex] in conditionsArray[conditionIndex]:
                    if mlResult[j]["featureName"][mlIndex] not in featureNames:
                        if isFirst:
                            isFirst=False
                        else:
                            if "inf" in mlResult[j]["categories"][mlIndex]:
                                mlIndex+=1
                    else:
                        featureNames.append(mlResult[j]["featureName"][mlIndex])
            
            #replace the range bound
            #todo: need to fix the bug below: list index out of range, and then turn it back
                try:
                    if "<=" in conditionsArray[conditionIndex]: 
                        # if mlResult[j]["featureName"][conditionIndex-1] in conditionsArray[conditionIndex]:
                        mlResult[j]["categories"][conditionIndex-1]=mlResult[j]["categories"][conditionIndex-1].replace(")","]")
                    elif ">=" in conditionsArray[conditionIndex]: 
                        # if mlResult[j]["featureName"][conditionIndex-1] in conditionsArray[conditionIndex]:
                        mlResult[j]["categories"][conditionIndex-1]=mlResult[j]["categories"][conditionIndex-1].replace("(","[")
                    elif "=" in conditionsArray[conditionIndex]:
                        if mlResult[j]["featureName"][conditionIndex-1] in conditionsArray[conditionIndex]:
                            #todo: we need to handle the input of boolean variable
                            #hardcode as "yes" and "no" for current version
                            if mlResult[j]["categories"][conditionIndex-1]=="yes":
                                mlResult[j]["categories"][conditionIndex-1]='[1,1]'
                            elif mlResult[j]["categories"][conditionIndex-1]=="no":
                                mlResult[j]["categories"][conditionIndex-1]='[0,0]'
                except Exception as ex:
                    print("!ERROR: ", ex, "  \n j=", j)
        j += 1
    return mlResult