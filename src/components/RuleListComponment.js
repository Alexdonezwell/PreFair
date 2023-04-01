import React from 'react';
import * as d3 from 'd3';
import { sliderBottom } from 'd3-simple-slider';
import './RuleListComponment.css'
import $ from "jquery";
// window.jQuery = window.$ = $;
// import "../assets/checkbox-group.js";

class RuleListComponment extends React.Component {
    constructor(props) {
        super(props);
        this.ruleList = { "ranges": {} };
        this.numberOfBins = 20;
        this.maxBarWidth = 100; // px
    }

    componentDidMount() {
        // const { data, mlStdResult } = this.props;
        // this.drawSliderBasedOnDifferentMlResult(data, mlStdResult, "ranges");
    }

    componentDidUpdate(prevProps, prevState) {
        if (this.props.mlStdResult === prevProps.mlStdResult) {
            return
        }
        const { ruleItemsData, mlStdResult } = this.props;
        d3.select("#ranges").html("");
        this.ruleList = { "ranges": {} };
        this.drawSliderBasedOnDifferentMlResult(ruleItemsData, mlStdResult, "ranges");
    }

    drawSliderBasedOnDifferentMlResult(data, mlResult, divId) {
        const { onUpdatedRuleValue, parentComponment, ruleItemsData } = this.props;

        // var matchedIds = new Set(mlResult["unselectedMatchedId"]);
        // var selectedButNotMatched = new Set(mlResult["selectedButNotMatched"]);
        //console.log(mlResult);
        if (mlResult == null)
            return;
        if (mlResult["msg"] != "null") {
            $("#ruleLearningAlertMsg").show();
            $("#ruleLearningAlertMsg").html(mlResult["msg"]);
        } else {
            $("#ruleLearningAlertMsg").html("");
            $("#ruleLearningAlertMsg").hide();
        }
        let eachRules = mlResult["eachRules"];
        if (!eachRules || eachRules.length == 0 || eachRules[0] == undefined) {
            return;
        }

        for (var i = 0; i < eachRules.length; i++) {
            let featureNameList = eachRules[i]["featureName"];
            let categoriesList = eachRules[i]["categories"];
            let label = eachRules[i]["pred_label"];

            if (!featureNameList) {
                continue;
            }
            for (var j = 0; j < featureNameList.length; j++) {
                var featureName = featureNameList[j];
                var oneRuleRange = categoriesList[j];

                if (!this.ruleList[divId][i]) {
                    this.ruleList[divId][i] = {};
                }

                var condtionContent = oneRuleRange.match(/(\[|\()(.*?)(\]|\))/);
                if (condtionContent == null) {
                    condtionContent = oneRuleRange.match(/\{(.*?)\}/);

                    if (condtionContent == null) {
                        let res = oneRuleRange.replace(/\s/g, "")
                        var conditionUnderOneRule = [res, res, "[", "]"];
                    } else {
                        let res = condtionContent[1].replace(/\s/g, "").split(",")
                        var conditionUnderOneRule = res;
                    }
                } else {
                    var conditionUnderOneRule = condtionContent[2].replace(/\s/g, "").split(",");
                    var leftBracketType = condtionContent[1].replace(/\s/g, "");
                    var rightBracketType = condtionContent[3].replace(/\s/g, "");
                    if (conditionUnderOneRule != null) {
                        for (k = 0; k < conditionUnderOneRule.length; k++) {
                            if (String(conditionUnderOneRule[k]) == "inf") {
                                conditionUnderOneRule[k] = Number.POSITIVE_INFINITY;
                            } else if (String(conditionUnderOneRule[k]) == "-inf") {
                                conditionUnderOneRule[k] = Number.NEGATIVE_INFINITY;
                            } else {
                                conditionUnderOneRule[k] = parseFloat(conditionUnderOneRule[k]);
                            }
                        }
                        conditionUnderOneRule.push(leftBracketType);
                        conditionUnderOneRule.push(rightBracketType);
                    } else {
                        console.log("default");
                    }
                }

                this.ruleList[divId][i]["label"] = label;
                this.ruleList[divId][i][featureName] = conditionUnderOneRule;//for example, [3.2,4.5,"(","]"]
                //ruleList[divId][i]["leftBracketType"]=leftBracketType;
                //ruleList[divId][i]["rightBracketType"]=rightBracketType;

            }
        }

        // render slider base on the rule obj
        // Draw user selected nodes
        //createRuleFlow(divId, -1);

        let ruleIds = Object.keys(this.ruleList[divId]);
        let orderId = 0;
        for (var i = 0; i < ruleIds.length; i++) {
            // d3.select("#" + divId)
            //   .append("div")
            //   .attr("id", divId + "rule_" + ruleIds[i]);

            let rule = this.ruleList[divId][ruleIds[i]];
            // !!!: revemo negative boxs
            if (rule.label == 0) {
                continue;
            }
            orderId += 1;
            let ruleBoxId = divId + "ruleid_" + ruleIds[i];
            let ruleIdInfoId = ruleBoxId + "info";

            d3.select("#" + divId)
                .append("div")
                .attr("id", ruleBoxId)
                .attr("class", "box")
                .attr("_ruleid", ruleIds[i])
                // .on("mouseover", function () {
                //     if (window.event.shiftKey) {
                //         return;
                //     }
                //     let ruleid = d3.select(this).attr("_ruleid");

                //     d3.select(this)
                //         .style("border-style", "solid")
                //         .style("border-color", "tomato");

                //     var matchedRuleIds = new Set();

                //     $("#" + divId + "ruleid_" + ruleid + "infoBarDivNegativeBackground div").css("background-color", "orange");
                //     $("#" + divId + "ruleid_" + ruleid + "infoBarDivPositiveBackground div").css("background-color", "orange");

                //     /////
                //     // let ruleItem = this.ruleList[divId][ruleid];

                //     // for (var i = 0; i < node._groups[0].length; i++) {
                //     //     let oneNode = node._groups[0][i];

                //     //     //keys are either feature name or label; feature name is a sub rule
                //     //     let keys = Object.keys(ruleItem);
                //     //     var matchRule = false;
                //     //     for (var k = 0; k < keys.length; k++) {
                //     //         let featureName = keys[k];

                //     //         if (featureName == "label") {
                //     //             continue;
                //     //         }

                //     //         let range = ruleItem[featureName];
                //     //         //to get the data value under that feature name (featureName)
                //     //         let val = oneNode.__data__[featureName];

                //     //         //matchRule = range[0] <= val && range[1] >= val;

                //     //         //determine the node matches this rule or not.
                //     //         // if (range[2] == "(" && range[3] == ")")
                //     //         //   matchRule = range[0] < val && range[1] > val;
                //     //         // else if (range[2] == "(" && range[3] == "]")
                //     //         //   matchRule = range[0] < val && range[1] >= val;
                //     //         // else if (range[2] == "[" && range[3] == ")")
                //     //         //   matchRule = range[0] <= val && range[1] > val;
                //     //         // else if (range[2] == "[" && range[3] == "]")
                //     //         //   matchRule = range[0] <= val && range[1] >= val;
                //     //         // else if (range[0] !== undefined && range[1] !== undefined || range.length <= 2)
                //     //         //   matchRule = range[0] <= val && range[1] >= val;
                //     //         matchRule = isMatchCondition(range, val);

                //     //         if (!matchRule) {
                //     //             break;
                //     //         }
                //     //     }
                //     //     if (matchRule) {
                //     //         matchedRuleIds.add(oneNode.__data__.id);
                //     //     }
                //     // }

                //     // var ruleMatchedData = [];

                //     // for (var i = 0; i < node._groups[0].length; i++) {
                //     //     let item = node._groups[0][i];
                //     //     if (matchedRuleIds.has(item.__data__.id)) {
                //     //         item.style.stroke = "tomato";
                //     //         item.style["stroke-width"] = 2;
                //     //     }
                //     // }
                //     // for (var i = 0; i < lihca.d3Dataset.length; i++) {
                //     //     if (matchedRuleIds.has(lihca.d3Dataset[i].id)) {
                //     //         ruleMatchedData.push(lihca.d3Dataset[i]);
                //     //     }
                //     // }
                //     // displaySelectedData(ruleMatchedData);
                // })
                // .on("mouseout", function () {
                //     if (window.event.shiftKey) {
                //         return;
                //     }
                //     let ruleid = d3.select(this).attr("_ruleid");
                //     $("#" + divId + "ruleid_" + ruleid + "infoBarDivNegativeBackground div").css("background-color", "grey");
                //     $("#" + divId + "ruleid_" + ruleid + "infoBarDivPositiveBackground div").css("background-color", "rgb(85, 26, 139)");
                //     d3.select(this)
                //         .style("border-style", null)
                //         .style("border-color", null);
                //     // displayNodesByRules(divId);
                //     // let ruleid = d3.select(this).attr("_ruleid");
                //     // var matchedRuleIds = new Set(
                //     //   mlResultFromLIHCA.eachRules[ruleid]["matchedIds"]
                //     // );
                //     // for (var i = 0; i < node._groups[0].length; i++) {
                //     //   let item = node._groups[0][i];
                //     //   if (matchedRuleIds.has(item.__data__.id)) {
                //     //     displaySingleNodeByRules(item);
                //     //   // }
                //     // }
                // })
                .on("click", function () {
                    const allNodes = this.parentElement.childNodes;
                    for (let i = 0; i < allNodes.length; i++) {
                        allNodes[i].style = null;
                    }

                    d3.select(this)
                        .style("border-style", "solid")
                        .style("border-color", "tomato");

                    onUpdatedRuleValue(parentComponment, rule, ruleItemsData);
                });

            d3.select("#" + ruleBoxId)
                .append("div")
                .attr("id", ruleIdInfoId)
                .attr("class", "ruleInfo")
                .append("div")
                .attr("id", ruleIdInfoId + "txt")
                .style("float", "left")
                .append("p")
                .append("b")
                // .text("Rule ID: " + ruleIds[i]);
                .text(" Descriptive Rules: ");


            let features = Object.keys(rule);
            let label = rule["label"];

            for (var k = 0; k < features.length; k++) {
                if (features[k] == "label") {
                    continue;
                }
                this.drawSlider(divId, data, features[k], rule[features[k]], ruleIds[i], label, k);
            }
            //createRuleFlow(divId, ruleIds[i]);
            this.drawRuleStackedBars(ruleIdInfoId, divId, ruleIds[i]);
        }
    };

    drawSlider(divId, data, featureName, conditionsUnderOneRule, ruleId, label, conditionId) {
        const { onUpdatedRuleValue, parentComponment, ruleItemsData } = this.props;

        data = data.map(function (d) {
            return d[featureName];
        });

        let isBoolData = data.some(x => x == 'yes' || x == 'no');
        let isEnum = data.some(x => typeof (x) == "string")
        // const isEnum = false;

        if (isBoolData) {
            data = data.map(x => x == 'yes' ? 1 : 0)
        }

        if (isEnum && !isBoolData) {
            data = data.map(x => parseInt(x.replace(/"/g, "")));
        }

        //rule Div
        let ruleDivName = divId + "ruleid_" + ruleId;
        let sliderId = divId + "sliderName" + ruleId + featureName.replace(/[^a-zA-Z]/g, "");
        let histogramName = divId + "slider_histogram" + ruleId + "_" + conditionId;
        let subSliderId = divId + "slider" + ruleId + "_" + conditionId;
        let conditionInfoDiv = "conditionInfo" + ruleDivName + "conditionId_" + conditionId
        let conditionInfoTxtDiv = "conditionTxtInfo" + ruleDivName + "conditionId_" + conditionId
        let conditionInfoBarDiv = "conditionBarInfo" + ruleDivName + "conditionId_" + conditionId

        let minData = Math.min(...data);
        let maxData = Math.max(...data);


        if (isBoolData) {
            // Draw the single slider
            var sliderRange = sliderBottom()
                .min(minData)
                .max(maxData)
                .width(200)
                .tickFormat(d3.format(".3n"))
                .ticks(1)
                .step(1.0)
                .default(conditionsUnderOneRule[0])
                .on("onchange", val => {
                    this.updateSliderHistogram(histogramName, minData, maxData, [val, val]);
                })
                .on("end", val => {
                    let foramtDial = d3.format(".3n");

                    d3.select("#" + sliderId)
                        .html(
                            featureName +
                            ": <br/> x =" + val
                        )
                        .append("p")
                        .text(
                            "original x= :" + conditionsUnderOneRule[0]
                        );
                    // Update all nodes color
                    this.ruleList[divId][ruleId][featureName] = [val, val];
                    // this.displayNodesByRules(divId);

                    // Update the flow color
                    //this.drawRuleFlow(divId);

                    this.drawConditionStackedBars(conditionInfoDiv, conditionInfoBarDiv, divId, ruleId, conditionId);
                    this.drawRuleStackedBars(divId + "ruleid_" + ruleId + "info", divId, ruleId);
                    onUpdatedRuleValue(parentComponment, this.ruleList[divId][ruleId], ruleItemsData);
                });
        } else if (!isEnum) {
            // Draw the range slider
            var sliderRange = sliderBottom()
                .min(minData)
                .max(maxData)
                .width(200)
                .tickFormat(d3.format(".3n"))
                .ticks(5)
                .default([conditionsUnderOneRule[0], conditionsUnderOneRule[1]])
                .fill("#2196f3")
                .on("onchange", val => {
                    this.updateSliderHistogram(histogramName, minData, maxData, val);
                })
                .on("end", val => {
                    let foramtDial = d3.format(".3n");

                    d3.select("#" + sliderId)
                        .html(
                            featureName +
                            ": <br/> " +
                            foramtDial(val[0]) +
                            " <= x <=" +
                            foramtDial(val[1])
                        )
                        .append("p")
                        .text(
                            "original range:(" +
                            conditionsUnderOneRule[0] +
                            " , " +
                            conditionsUnderOneRule[1] +
                            ")"
                        );
                    // Update all nodes color
                    this.ruleList[divId][ruleId][featureName] = val;
                    // this.displayNodesByRules(divId);

                    // Update the flow color
                    //this.drawRuleFlow(divId);

                    this.drawConditionStackedBars(conditionInfoDiv, conditionInfoBarDiv, divId, ruleId, conditionId);
                    this.drawRuleStackedBars(divId + "ruleid_" + ruleId + "info", divId, ruleId);
                    onUpdatedRuleValue(parentComponment, this.ruleList[divId][ruleId], ruleItemsData);
                });
        } else {
            // enum data
            //      console.log("data");
            // this.element.html('<input type="checkbox" id="cb1" value="1"></input> <input type="checkbox" id="cb2" value="2"></input>');

        }

        var rangeDisplay = function () {
            if (Number.isInteger(sliderRange.value())) {
                return featureName + ": <br />" + "x =" + sliderRange.value();
            }

            var rangeInterval = sliderRange.value().map(d3.format(".3n"));
            var displayRange = "";
            if (rangeInterval[0] == "-Infinity") {
                if (conditionsUnderOneRule[3] == ")")
                    displayRange = featureName + ": <br /> x<" + rangeInterval[1];
                else if (conditionsUnderOneRule[3] == "]")
                    displayRange = featureName + ": <br /> x <=" + rangeInterval[1];//&le stands for <=
            } else if (rangeInterval[1] == "Infinity") {
                if (conditionsUnderOneRule[2] == "(")
                    displayRange = featureName + ": <br /> x>" + rangeInterval[0];
                else if (conditionsUnderOneRule[2] == "[")
                    displayRange = featureName + ": <br /> x >=" + rangeInterval[0];//&ge stands for >=
            } else {
                if (conditionsUnderOneRule[2] == "(" && conditionsUnderOneRule[3] == ")")
                    displayRange = featureName + ": <br />" + rangeInterval[0] + "< x <" + rangeInterval[1];
                else if (conditionsUnderOneRule[2] == "(" && conditionsUnderOneRule[3] == "]")
                    displayRange = featureName + ": <br />" + rangeInterval[0] + "< x <=" + rangeInterval[1];
                else if (conditionsUnderOneRule[2] == "[" && conditionsUnderOneRule[3] == ")")
                    displayRange = featureName + ": <br />" + rangeInterval[0] + "<= x <" + rangeInterval[1];
                else if (conditionsUnderOneRule[2] == "[" && conditionsUnderOneRule[3] == "]") {
                    if (rangeInterval[0] == rangeInterval[1]) {
                        displayRange = featureName + ": <br />" + "x =" + rangeInterval[0];
                    }
                    else {
                        displayRange = featureName + ": <br />" + rangeInterval[0] + "<= x <=" + rangeInterval[1];
                    }
                }
            }
            return displayRange;
        };

        console.log(ruleId, label, conditionId);
        const ruleSubconditionDiv = ruleDivName + "_condition" + conditionId;
        d3.select("#" + ruleDivName)
            .append("div")
            .attr("id", ruleSubconditionDiv)
            .attr("class", "ruleConditionBox")

        if (isEnum) {
            let list = "";
            if (conditionsUnderOneRule[2] == '[' && conditionsUnderOneRule[3] == ']') {
                list = conditionsUnderOneRule[0];
            } else {
                list = conditionsUnderOneRule.reduce((a, b) => a + (a.length > 0 ? "," : "") + b).replace(/\"/g, "")
            }

            let displayFeatureName = featureName;
            switch (displayFeatureName) {
                case "reweights":
                    displayFeatureName = "Bias Mitigation Algorithms";
                    break;
                case "norms":
                    displayFeatureName = "Normalizations";
                    break;
                case "pcas":
                    displayFeatureName = "Principle Conponent Analysis";
                    break;
                default:
                    break;
            }

            d3.select("#" + ruleSubconditionDiv)
                .append("div")
                .attr("id", conditionInfoDiv)
                .append("div")
                .attr("id", conditionInfoTxtDiv)
                .style('float', 'left')
                .style('margin-left', '5px')
                .append("p")
                .attr("id", sliderId)
                .html(displayFeatureName);
                // .html(featureName + ": <br />" + "x in " + list);

            // TODO rangeDisplay
            // $('#' + sliderId).checkboxGroup();

        } else {
            d3.select("#" + ruleSubconditionDiv)
                .append("div")
                .attr("id", conditionInfoDiv)
                .append("div")
                .attr("id", conditionInfoTxtDiv)
                .style('float', 'left')
                .append("p")
                .attr("id", sliderId)
                .html(rangeDisplay);
        }
        // Display Text

        // }

        //display stacked bars for both negative and positve
        // d3.select("#" + conditionInfoDiv)
        //   .append("div")
        //   .attr("id", conditionInfoBarDiv)
        //   .style('float', 'right')
        //   .style('bottom', 0);

        this.drawConditionStackedBars(conditionInfoDiv, conditionInfoBarDiv, divId, ruleId, conditionId)

        // .append("p")
        // .attr("id", "test123")
        // .html("test");
        // Create histogram

        var histogramWidth = 220,
            histogramHeight = 100,
            histogramOffsetLeft = 10,
            histogramOffsetRight = 10;

        let enumerateIds = new Set();
        for (var i = 0; i < data.length; i++) {
            enumerateIds.add(data[i]);
        }

        // If the count of the value is less then 20 in data set, then it's Enumerate Data
        //todo: and also integer
        const isEnumerateData = enumerateIds.size <= 30;
        let binNum = this.numberOfBins, typeOfInsertBin = 0; // 0 - not enumerated, 1 - enumerated with 3x, 2 - enumerated with 2x, 3 - enumerated with 1x

        if (isEnumerateData) {
            if (enumerateIds.size <= 6) {
                // enumerated with 3x
                typeOfInsertBin = 1;
                binNum = enumerateIds.size + ((enumerateIds.size - 1) * 2);
            } else if (enumerateIds.size <= 13) {
                typeOfInsertBin = 2;
                binNum = enumerateIds.size + enumerateIds.size - 1;
            } else {
                typeOfInsertBin = 3;
                binNum = enumerateIds.size;
            }

            enumerateIds = [...enumerateIds].sort((a, b) => a - b)
        }

        //////// BIN number
        var bins = new Array(binNum).fill(0),
            range = maxData - minData,
            rangePerBin = range / (binNum - 1);

        d3.select("#" + ruleSubconditionDiv)
            .append("div")
            .attr("id", histogramName)
            .attr("class", "histogra-area")
            .style("margin-left", histogramOffsetLeft + "px")
            .style("margin-right", histogramOffsetRight + "px")
            .style("height", histogramHeight + "px")
            .style("width", histogramWidth + "px");

        for (var i = 0; i < data.length; i++) {
            var binIdx = parseInt((data[i] - minData) / rangePerBin);

            if (binIdx >= binNum) {
                binIdx -= 1;
            }
            bins[binIdx] += 1;
        }

        d3.select("#" + histogramName).attr("_number_of_bin", binNum);

        if (isEnumerateData) {
            // if the value set is enumerate, we put the mark in HTML
            d3.select("#" + histogramName).attr("_is_enumerate", "true");
        }

        let widthPerBin = (1 / binNum) * 100;
        let maxBin = Math.max(...bins);
        let heightRatio = histogramHeight / maxBin;

        for (i = 0; i < bins.length; i++) {
            let height = bins[i] * heightRatio,
                inRangeOffset = histogramHeight - height,
                outRangeOffset = -(histogramHeight - height * 2);

            let enumerate_value = "";
            if (isEnumerateData) {
                switch (typeOfInsertBin) {
                    case 1:
                        enumerate_value = i % 3 == 0 ? parseInt(enumerateIds[i / 3]) : "";
                        break;
                    case 2:
                        enumerate_value = i % 2 == 0 ? parseInt(enumerateIds[i / 2]) : "";
                        break;
                    case 3:
                        enumerate_value = enumerateIds[i];
                        break;
                }
            }

            let binHtml =
                "<div class='histogram-col' " +
                (isEnumerateData ? "_enumerate_value='" + enumerate_value + "'" : "") +
                " style='float:left!important;width:" +
                widthPerBin +
                "%;height:100%;overflow:hidden;'>" +
                "<div class='bin in-range' style='height:" +
                height +
                "px;bottom:-" +
                inRangeOffset +
                "px;position: relative;'></div>" +
                "<div class='bin out-of-range' style='height:" +
                height +
                "px;bottom:" +
                outRangeOffset +
                "px;position: relative;'></div>" +
                "</div>";

            $("#" + histogramName).append(binHtml);
        }

        // Create Slider and checkboxes for categorical data

        if (isEnum) {
            d3
                .select("#" + ruleSubconditionDiv)
                .append("div")
                .attr("id", subSliderId)
                .style("background-color", function () {
                    return label === 1 ? "#551A8B" : "#D3D3D3";
                });


            const checkboxGroupFunc = function (module, options) {
                var self = module;
                self.options = options;
                var selectOptions = Array.from(self.options.selectOptions).sort(function (a, b) { return a - b }),
                    // defaultSelected = self.options.defaultSelected.map(x => parseInt(x.replace(/\"/g, ""))),
                    ruleDivName = self.options.ruleDivName,
                    subSliderId = self.options.subSliderId,
                    featureName = self.options.featureName,
                    onchange = self.options.onchange;
    
                const flagsArr = {  "norms": ["None", "L1", "L2", "both"], 
                                    "pcas": ["None", "PCA3", "PCA5", "both"], 
                                    "reweights": ["None", "Reweighting", "DIR", "both"] }
                let warpHtml = "";
    
                selectOptions.forEach((x, i) => {
                    if (i != 0 && i % 8 == 0) {
                        warpHtml += "<br>";
                    }
    
                    // warpHtml += '<label style="width:40px"><input type="checkbox" id="' + ruleDivName + subSliderId + '_cb' + x + '" ' +
                    //     (defaultSelected.includes(x) ? 'checked' : '') + ' value="' + x + '"></input>' + x + '</label>';
                    let warpStyle = "flex:1;text-align: center;color: white;font-size: 9px; font-weight: bold;";
                    warpHtml += '<label style="' + warpStyle + '">' + flagsArr[featureName][x] + '</label>';
                });
    
                self.html("<div id='" + ruleDivName + "_" + subSliderId + "' style='display:flex;flex-direction:row'>" + warpHtml + "</div>");
    
                // selectOptions.forEach(x => {
                //     $("#" + ruleDivName + subSliderId + '_cb' + x).change(function () {
                //         let checkedBoxs = $("#" + ruleDivName + "_" + subSliderId + " input[type='checkbox']:checked");
                //         var checkedValue = [];
    
                //         for (let i = 0; i < checkedBoxs.length; i++) {
                //             const element = checkedBoxs[i];
                //             checkedValue.push(element.value);
                //         }
    
                //         // TODO:
                //         onchange(checkedValue);
                //     });
                // });
    
            };

            checkboxGroupFunc(
                $('#' + subSliderId),
                {
                    selectOptions: enumerateIds,
                    defaultSelected: conditionsUnderOneRule,
                    ruleDivName: ruleSubconditionDiv,
                    subSliderId: subSliderId,
                    featureName: featureName
                }
            );

            // $('#' + subSliderId).checkboxGroup({
            //     selectOptions: enumerateIds,
            //     defaultSelected: conditionsUnderOneRule,
            //     ruleDivName: ruleSubconditionDiv,
            //     subSliderId: subSliderId,
            //     onchange: function (checkedList) {
            //         //histogramName 

            //         // Update histgrame
            //         // Update node

            //         var binNum = d3.select("#" + histogramName).attr("_number_of_bin");
            //         for (var i = 0; i < binNum; i++) {
            //             const enmeratedVal = parseFloat($("#" + histogramName + " div.histogram-col:eq(" + i + ")").attr("_enumerate_value"));
            //             if (enmeratedVal != NaN) {
            //                 $("#" + histogramName + " div.histogram-col:eq(" + i + ") .in-range").css("opacity", (checkedList.includes(enmeratedVal) || checkedList.includes(enmeratedVal.toString()) ? 1.0 : 0.0));
            //             }
            //         }

            //         this.ruleList[divId][ruleId][featureName] = checkedList;

            //         this.drawConditionStackedBars(conditionInfoDiv, conditionInfoBarDiv, divId, ruleId, conditionId);
            //         this.drawRuleStackedBars(divId + "ruleid_" + ruleId + "info", divId, ruleId);
            //     }
            // });


            // Update histogram

            for (var i = 0; i < binNum; i++) {
                const enmeratedVal = parseFloat($("#" + histogramName + " div.histogram-col:eq(" + i + ")").attr("_enumerate_value"));
                if (enmeratedVal != NaN) {
                    $("#" + histogramName + " div.histogram-col:eq(" + i + ") .in-range").css("opacity", (conditionsUnderOneRule.includes(enmeratedVal) || conditionsUnderOneRule.includes(enmeratedVal.toString()) ? 1.0 : 0.0));
                }
            }

        } else {
            var gRange = d3
                .select("#" + ruleSubconditionDiv)
                .append("div")
                .attr("id", subSliderId)
                .style("background-color", function () {
                    return label === 1 ? "#551A8B" : "#D3D3D3";
                })
                .append("svg")
                .attr("width", 260)
                .attr("height", 50)
                .append("g")
                .style("transform", "translate(25px,10px)")
                .call(sliderRange);
        }

        d3.selectAll("#" + subSliderId + " > svg > g > g").style("transform", "scaleX(1.05)");

        var val = [];

        if (conditionsUnderOneRule[0] == -Infinity)
            val.push(minData);
        else
            if (conditionsUnderOneRule[2] == "(")
                val.push(conditionsUnderOneRule[0] + 0.5);
            else
                val.push(conditionsUnderOneRule[0]);


        if (conditionsUnderOneRule[1] == Infinity)
            val.push(maxData);
        else
            if (conditionsUnderOneRule[2] == ")")
                val.push(conditionsUnderOneRule[1] - 0.5);
            else
                val.push(conditionsUnderOneRule[1])
        this.updateSliderHistogram(histogramName, minData, maxData, val);
    };

    updateSliderHistogram(histogramName, min, max, val) {
        // check if current histogram is enumerate data set
        var isEnumerateDataSet = d3.select("#" + histogramName).attr("_is_enumerate") === "true";
        var binNum = d3.select("#" + histogramName).attr("_number_of_bin");

        let binRange = (max - min) / binNum;

        for (var i = 0; i < binNum; i++) {
            // Hit test
            const enmeratedVal = parseFloat($("#" + histogramName + " div.histogram-col:eq(" + i + ")").attr("_enumerate_value"));

            var opaval = 0.0;

            if (isEnumerateDataSet && enmeratedVal != null && val[0] <= enmeratedVal && val[1] >= enmeratedVal) {
                opaval = 1.0;
            } else if (!isEnumerateDataSet) {
                var minRange = min + binRange * i;
                var maxRange = minRange + binRange;

                if (val[0] <= minRange && val[1] >= maxRange) {
                    // completed cover
                    opaval = 1.0;
                } else if (
                    ((val[0] >= minRange && val[0] < maxRange) || (val[1] >= minRange && val[1] < maxRange))
                ) {
                    // partially cover
                    let coverMin = Math.max(val[0], minRange);
                    let coverMax = Math.min(val[1], maxRange);

                    if (coverMax == coverMin) {
                        opaval = 1.0
                    } else {
                        opaval = (coverMax - coverMin) / binRange;
                    }
                }
            }

            $("#" + histogramName + " div.histogram-col:eq(" + i + ") .in-range").css(
                "opacity",
                opaval
            );
        }
    };

    getPositiveData() {
        const { ruleItemsData, mlStdResult } = this.props;
        return ruleItemsData
    }
    getNegativeData() {
        return []
    }

    drawConditionStackedBars(conditionInfoDiv, conditionInfoBarDiv, divId, ruleId, conditionId) {
        let positiveData = this.getPositiveData();
        let negativeData = this.getNegativeData();
        let totalItem = positiveData.length + negativeData.length;
        let rate = this.maxBarWidth / totalItem;
        $("#" + conditionInfoBarDiv).remove();
        $("#" + conditionInfoDiv + "clearDiv").remove();
        d3.select("#" + conditionInfoDiv)
            .append("div")
            .attr("id", conditionInfoBarDiv)
            .attr("class", "condition_bar")
            .style('float', 'right')
            .style('bottom', 0);

        //positive background bar
        d3.select("#" + conditionInfoBarDiv)
            .append("div")
            .attr("id", conditionInfoBarDiv + "PositiveBackground")
            .attr("class", "conditionInfoBarBackgroundPositive")
            .style("width", rate * positiveData.length + "px");

        //negative background bar
        d3.select("#" + conditionInfoBarDiv)
            .append("div")
            .attr("id", conditionInfoBarDiv + "NegativeBackground")
            .attr("class", "conditionInfoBarBackgroundNegative")
            .style("width", rate * negativeData.length + "px");

        //clear float style
        d3.select("#" + conditionInfoDiv)
            .append("div")
            .attr("id", conditionInfoDiv + "clearDiv")
            .style('clear', 'both');

        this.updateConditionStackedBars(conditionInfoBarDiv, divId, ruleId, conditionId, 1.0);

    }

    updateConditionStackedBars(conditionInfoBarDiv, divId, ruleId, conditionId, rate) {
        //div id here is either "ranges" or "extranges"
        var matchedConditionPositiveDataCount = 0;
        var matchedConditionNegativeDataCount = 0;
        let ruleItem = this.ruleList[divId][ruleId];
        //let isPositiveRule = ruleItem["label"] === 1;
        // let dataList = isPositiveRule ? positiveData : negativeData;
        //var nextList = [];
        //for example ruleItem looks like:
        //{label: 1, Socialdrinker: Array(4), Bodymassindex: Array(4)}
        let keys = Object.keys(ruleItem);
        let conditionRange = ruleItem[keys[conditionId]];

        //todo: >=,<=,<,>
        // for (var j = 0; j < dataList.length; j++) {
        //   var matchCondition = false;
        //   let conditionVal = dataList[j][keys[conditionId]];
        //   matchCondition = conditionRange[0] <= conditionVal && conditionRange[1] >= conditionVal;
        //   if (matchCondition) {
        //     if (isPositiveRule)
        //       matchedCondtionPositiveData.push(dataList[j]);
        //     else
        //       matchedConditionNegativeData.push(dataList[j]);
        //   }
        //   else {
        //     if (isPositiveRule)
        //       matchedConditionNegativeData.push(dataList[j]);
        //     else
        //       matchedCondtionPositiveData.push(dataList[j]);
        //   }
        // }

        var totalPostiveCount = 0, totalNegativeCount = 0;

        // for (var i = 0; i < node._groups[0].length; i++) {
        //     let oneNode = node._groups[0][i];
        //     var matchCondition = false;
        //     let conditionVal = node._groups[0][i].__data__[keys[conditionId]];

        //     matchCondition = isMatchCondition(conditionRange, conditionVal)
        //     //matchCondition = conditionRange[0] <= conditionVal && conditionRange[1] >= conditionVal;

        //     if ((oneNode.__data__.status & nodeStatus.SELECTED) == nodeStatus.SELECTED) {
        //         totalPostiveCount += 1;
        //         if (matchCondition) {
        //             matchedConditionPositiveDataCount += 1;
        //         }
        //     } else {
        //         totalNegativeCount += 1;
        //         if (matchCondition) {
        //             matchedConditionNegativeDataCount += 1;
        //         }
        //     }
        // }

        d3.select("#" + conditionInfoBarDiv + "PositiveBackground")
            .append("div")
            // .style("width", rate * matchedConditionPositiveDataCount + "px")
            .style("width", ((matchedConditionPositiveDataCount / totalPostiveCount) * 100) + "%")
            .style("background-color", "rgb(85, 26, 139)")
            .style("height", "100%");

        d3.select("#" + conditionInfoBarDiv + "NegativeBackground")
            .append("div")
            // .style("width", rate * matchedConditionNegativeDataCount + "px")
            .style("width", ((matchedConditionNegativeDataCount / totalNegativeCount) * 100) + "%")
            .style("background-color", "grey")
            .style("height", "100%");
    };

    drawRuleStackedBars(ruleInfoDiv, divId, ruleId) {
        let positiveData = this.getPositiveData();
        let negativeData = this.getNegativeData();
        let totalItem = positiveData.length + negativeData.length;
        let ruleInfoBarDiv = ruleInfoDiv + "BarDiv";
        let rate = this.maxBarWidth / totalItem;
        $("#" + ruleInfoBarDiv).remove();
        $("#" + ruleInfoDiv + "clearDiv").remove();
        d3.select("#" + ruleInfoDiv)
            .append("div")
            .attr("id", ruleInfoBarDiv)
            .attr("class", "rule_bar")
            .style('float', 'right')
            .style('bottom', 0);

        //positive background bar
        d3.select("#" + ruleInfoBarDiv)
            .append("div")
            .attr("id", ruleInfoBarDiv + "PositiveBackground")
            .attr("class", "ruleInfoBarBackgroundPositive")
            .style("width", rate * positiveData.length + "px");

        //negative background bar
        d3.select("#" + ruleInfoBarDiv)
            .append("div")
            .attr("id", ruleInfoBarDiv + "NegativeBackground")
            .attr("class", "ruleInfoBarBackgroundNegative")
            .style("width", rate * negativeData.length + "px");

        //clear float style
        d3.select("#" + ruleInfoDiv)
            .append("div")
            .attr("id", ruleInfoDiv + "clearDiv")
            .style('clear', 'both');

        // updateRuleStackedBars(ruleInfoBarDiv, divId, ruleId, rate);
    };

    render() {
        return (
            <div id="ranges" style={{ 'pointer-events': 'none' }}>
            </div>
        );
    }
}

export default RuleListComponment;