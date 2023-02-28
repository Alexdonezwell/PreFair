/**
 * @author Fine
 * @description Topographic Map
 */
import React from 'react';
import TreeMap from './components/TreeMap';
import TreeMap2 from './components/TreeMap2';
import BubbleDiagram from './components/BubbleDiagram';
import RuleListComponment from './components/RuleListComponment';
import data from './assets/data';
import { Select, Button } from 'antd'
import './App.css';
import 'antd/dist/antd.css'; // or 'antd/dist/antd.less'
import ReactEcharts from 'echarts-for-react';
import { QuestionCircleOutlined, PlusSquareOutlined, MinusSquareOutlined } from '@ant-design/icons';
import flare from './flare';
import ruleItemsData from './ruleItemsData';
import $ from "jquery"
import axios from 'axios';
import ReactTooltip from 'react-tooltip';
import PopupScatterSelection from './components/PopupScatterSelection';
import { index, tree } from 'd3';

const apiDomain = "http://" + window.location.hostname + ":5000/";
const mytextStyle = {
    color: "#333",
    fontStyle: "normal",
    fontWeight: "normal",
    // fontFamily:"sans-serif",
    fontSize: 12,
};
const { Option } = Select;
var self = undefined;

const scatterColorList = ["#abedd8", "#f6416c", "#ffde7d", "#f8f3d4", "#3d84a8", "#ff9999"]

class App extends React.Component {
    constructor(props) {
        super(props);
    }
    state = {
        step1Height: '',
        step2Height: '',
        step3Height: '',
        contentRightHeight2: '',
        contentRightHeight1: '',
        highLight: [],
        step1Data: [],
        step1tasks: [
            { id: 10, name: "None", category: "break", type: '', taking: [1, 2] },
            { id: 1, name: "Normalization l1", category: "wip", type: 'primary' },
            { id: 2, name: "Normalization l2", category: "wip", type: 'primary' },
            { id: 11, name: "None", category: "break", type: '', taking: [3, 4] },
            { id: 3, name: "PCA-3", category: "wip", type: 'primary' },
            { id: 4, name: "PCA-5", category: "wip", type: 'primary' },
            // { id: 5, name: "MDS-3", category: "wip", type: 'primary' },
            // { id: 6, name: "MDS-5", category: "wip", type: 'primary' },
            { id: 12, name: "None", category: "break", type: '', taking: [7, 8] },
            { id: 7, name: "Re-Weighting Algorithm", category: "wip", type: 'primary' },
            { id: 8, name: "Disparate Impact Remover", category: "wip", type: 'primary' },
        ],
        step7Tasks: [
            { id: 1, name: "Normalization l1", category: "wip", type: '' },
            { id: 2, name: "Normalization l2", category: "wip", type: '' },
            { id: 3, name: "PCA-3", category: "wip", type: '' },
            { id: 4, name: "PCA-5", category: "wip", type: '' },
            // { id: 5, name: "MDS-3", category: "wip", type: '' },
            // { id: 6, name: "NDS-5", category: "wip", type: '' },
            { id: 7, name: "Re-Weighting Algorithm", category: "wip", type: '' },
            { id: 8, name: "Disparate Impact Remover", category: "wip", type: '' },
        ],
        step4Data: [],
        step2select: 3,
        radarImgData: [],
        radarSelectedDotData: null,
        scatterData: {},
        scatterSelectButton: [],
        clusterRate: {},
        radarRuleData: [],
        radarTreeData: [],
        radarCustimizedTreeData: [],
        treeImgData: [],
        selectedData: [],
        treeDiagramShow: [], //控制显示隐藏
        treeDiagramData: [],
        timeTxt: "",
        clusterResult: [],
        bubbleDiagramOption: {
            data: [1000, 2000, 3000],
            groups: [[0], [1], [2]],
            width: 200,
            height: 200
        },
        scatterSelectedItemId: -1,
        scatterSelectedItemData: null,
        axisareaSelected: [],
        ruleStdResultData: {
            "eachRules": [{
                "categories": ["(-inf, -0.086000003]"],
                "confidence": "0.991",
                "default": false,
                "featureIds": [4],
                "featureName": ["equal_opportunity_difference"],
                "matchedIds": [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 12, 13, 14, 15, 16, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 33, 35, 37, 38, 39, 40, 41, 42, 45, 46, 47, 48, 49, 50, 51, 53, 54, 55, 56, 57, 58, 59, 60, 62, 63, 64, 65, 66, 67, 68, 69, 71, 72, 73, 74, 75, 76, 83, 85, 88, 89, 90, 91, 92, 94, 97, 98, 99, 101, 103, 104, 107, 108, 109, 111, 112, 113, 115, 117, 118, 119, 121, 122, 123, 124, 126, 130, 131, 132, 133, 136, 137, 140, 141, 142],
                "matchedIdsCount": 103,
                "pred": null,
                "pred_label": 0
            }, {
                "categories": ["(-inf, 0.72500002]", "(-0.086000003, inf)"],
                "confidence": "0.818",
                "default": false,
                "featureIds": [0, 4],
                "featureName": ["acc", "equal_opportunity_difference"],
                "matchedIds": [10, 31, 70, 80, 84, 95, 102, 105, 139],
                "matchedIdsCount": 9,
                "pred": null,
                "pred_label": 1
            }],
            "msg": "null",
            "selectedButNotMatched": null,
            "unselectedMatchedId": null
        },
        treeDataOrgin:[],//save step2 tree origin data
        clusterNumber:2,
        screenWidth:0
    }
    treeInfo = {
        data: data,
        width: 750,
        height: 500
    }
    selectedPanelData = {}

    componentWillMount = () => {
        let step1tasks = this.state.step1tasks;
        let url = apiDomain + 'step1';
        let that = this;
        let selected = [];
        for (let key in step1tasks) {
            const da = step1tasks[key];
            let val = this.convertName(da['name']);
            selected.push(val);
        }
        axios.post(url, selected).then(function (resp) {
            if (resp.status == 200) {
                console.log(resp.data);
                that.setState({
                    step1Data: resp.data
                });
                that.updateClustersRate(true);
            }
        }).catch(function (err) {
            console.log(err);
        });

        //set screen height
    }

    componentDidMount() {
        self = this
        this.updateWindowDimensions();
        window.addEventListener('resize', this.updateWindowDimensions);
        this.getTimeTxt();
        setTimeout(function () {
            document.querySelector("#strategiesTreeArea").scrollTop = 200;
        }, 200);
    }

    componentDidUpdate() {
        // let scatter = echarts.init(document.getElementById('scatterArea'));

    }

    updateWindowDimensions() {
        const height1 = (window.innerHeight - 150) * 0.7;
        const height2 = 300;
        const height = (window.innerHeight - 150) * 0.5;
        const step1height = height * 0.8 - 50;
        const step2height = 350;
        const step3height = height * 0.5 - 30;
        const width = window.screen.width / 2;
        self.setState({
            contentRightHeight1: (step1height + step2height + 100) + 'px',
            contentRightHeight2: height2 + 'px',
            step1Height: step1height + 'px',
            step2Height: step2height,
            step3Height: step3height,
            screenWidth: width,
        });
    }

    updateClustersRate = (isInit) => {
        const ids = this.getHighLightIDs();
        // const ids = this.state.highLight;
        let dataToBeSent = { selectedIds: ids };
        let that = this;
        $.ajax({
            type: "POST",
            url: apiDomain + "clustersrate",
            data: JSON.stringify(dataToBeSent),
            dataType: 'json',
            success: function (result) {
                self.setState({
                    clusterRate: result
                });
                if (isInit) {
                    const keys = Object.keys(result)
                    let maxKey = "kmeans", maxNum = 2, maxValue = -100

                    keys.forEach((k, i) => {
                        const subKeys = Object.keys(result[k]);
                        subKeys.forEach((subK, j) => {
                            if (maxValue < result[k][subK]) {
                                maxKey = k;
                                maxNum = subK;
                                maxValue = result[k][subK]
                            }
                        })
                    });

                    self.projectScatter("pca");
                    //self.getclusterResults(parseInt(maxNum), maxKey);
                    self.getclusterResults(that.state.clusterNumber, maxKey);
                }
            }
        });
    }

    onDragStart = (ev, id, name) => {
        ev.dataTransfer.setData("name", name);
    }
    onDragOver = (ev) => {
        ev.preventDefault();
    }
    // handleChange = (val) => {
    //     this.setState({ 'step2select': val });
    //     this.getclusterResults(parseInt(val));
    // }
    convertName = (val) => {
        let rst = '';
        switch (val) {
            case 'Normalization l1':
                rst = 'l1';
                break;
            case 'Normalization l2':
                rst = 'l2';
                break;
            case 'PCA-3':
                rst = 'PCA3';
                break;
            case 'PCA-5':
                rst = 'PCA5';
                break;
            case 'Re-Weighting Algorithm':
                rst = 'reweighing';
                break;
            case 'Disparate Impact Remover':
                rst = 'DisparateImpactRemover';
                break;
            default:
                rst = val;
                break;
        }
        return rst;
    }

    //判断target是否存在在数组newarr中
    checkNodeExist = (newarr, target) => {
        let rst = false;
        for (let key in newarr) {
            const d = newarr[key];
            if (d.name.trim() == target.trim()) {
                rst = true;
                break;
            }
        }
        return rst;
    }

    findChildren = (arr, target) => {
        let rst = [];
        for (let key in arr) {
            const d = arr[key];
            if (d.name.trim() == target.trim()) {
                rst = d.children;
                break;
            }
        }
        return rst;
    }

    getIndexChildren = (arr, target) => {
        let rst = 0;
        let size = arr.length;
        for (let i = 0; i < size; i++) {
            const d = arr[i];
            if (d.name.trim() == target.trim()) {
                rst = i;
                break;
            }
        }
        return rst;
    }
    insertChildren3 = (p1, p2, p3, target, i, children, highLight) => {
        let index = this.getIndexChildren(children, p1);
        let pchild1 = children[index].children;
        let index2 = this.getIndexChildren(pchild1, p2);
        let pchild2 = children[index].children[index2].children;
        let index3 = this.getIndexChildren(pchild2, p3);
        let pchild3 = children[index].children[index2].children[index3].children;
        let newchildren = [];
        if (pchild3.length > 0) {
            newchildren = children[index].children[index2].children[index3].children;
        }
        newchildren.push({ 'name': target, 'highLight': highLight, 'children': [] });
        children[index].children[index2].children[index3].children = newchildren;
        return children;
    }
    insertChildren2 = (p1, p2, target, i, children, highLight) => {
        let index = this.getIndexChildren(children, p1);
        let pchild1 = children[index].children;
        let index2 = this.getIndexChildren(pchild1, p2);
        let pchild2 = children[index].children[index2].children;
        let newchildren = [];
        if (pchild2.length > 0) {
            newchildren = children[index].children[index2].children;
        }
        newchildren.push({ 'name': target, 'highLight': highLight, 'children': [] });
        children[index].children[index2].children = newchildren;
        return children;
    }
    insertChildren = (parent, target, i, children, highLight) => {
        if (i == 0) {
            children.push({ 'name': target, 'highLight': highLight, 'children': [] });
        } else if (i == 1) {
            let index = this.getIndexChildren(children, parent);
            let newchildren = [];
            if (children[index].children.length > 0) {
                newchildren = children[index].children;
            }
            newchildren.push({ 'name': target, 'highLight': highLight, 'children': [] });
            children[index].children = newchildren;
        }
        return children;
    }
    //获取指定元素的子节点内容
    getSubChildren = (layer, children, parent) => {
        if (layer == 0) {
            return children;
        } else {
            let sub = [];
            for (let key in children) {
                const d = children[key];
                if (d.name.trim() == parent.trim()) {
                    sub = d.children;
                    break;
                }
            }
            return this.getSubChildren(layer - 1, sub, parent);
        }
    }

    highLightLevel1 = (children, target) => {
        for (let key in children) {
            const name = children[key]['name'].trim();
            if (name == target) {
                children[key]['highLight'] = 1;
            }
        }
        return children;
    }

    highLightLevel2 = (children, target) => {
        for (let key in children) {
            const detail = children[key]['children'];
            const highLight = children[key]['highLight'];
            for (let key2 in detail) {
                const name = detail[key2]['name'].trim();
                if (name == target && highLight == 1) {
                    children[key]['children'][key2]['highLight'] = 1;
                }
            }
        }
        return children;
    }
    getSubChildren1 = (data, parent)=>{
        let arr = [];
        if(parent==''){
            arr = data;
        }else{
            for(let key in data){
                const da = data[key];
                if(da.name.trim() == parent.trim()){
                    arr = da['children'];
                    break;
                }
            }
        }
        return arr;
    }

    getSubChildren2 = (data, d0, d1)=>{
        let arr = [];
        for(let key in data){
            const da = data[key];
            if(d0.trim() == da.name.trim()){
                let children = da['children'];
                for(let item in children){
                    let dd = children[item];
                    if(dd.name.trim() == d1.trim()){
                        arr = dd['children'];
                        break;
                    }
                }
            }
        }
        return arr;
    }

    getSubChildren3 = (data, d0, d1, d2)=>{
        let arr = [];
        for(let k1 in data){
            const da1 = data[k1];
            if(d0.trim() == da1.name.trim()){
                let c1 = da1['children'];

                for(let k2 in c1){
                    const da2 = c1[k2];
                    if(da2.name.trim() == d1){
                        let c2 = da2['children'];

                        for(let k3 in c2){
                            if(d2.trim() == c2[k3].name.trim()){
                                arr = c2[k3]['children'];
                            }
                        }
                    }
                }
            }
        }
        return arr;
    }

    getSubChildren0 = (data)=>{
        let arr = [];
        for(let key in data){
            const da = data[key];
            arr.push(da.name);
        }
        return arr;
    }

    checkNodeExist2 = (data, target)=>{
        let rst = false;
        for(let key in data){
            if(target == data[key]){
                rst = true;
                break;
            }
        }
        return rst;
    }
    getTreeChildren = (data) =>{
        let children = [];
        for(let key in data){
            const highLight = 0;
            const d = data[key].split(',');
            const size = d.length;
            let isExit = false;
            for (let i = 0; i < size; i++) {
                const target = d[i].trim();
                // let subChildren = this.getSubChildren(i, children, parent);
                let subChildren = [];
                if(i == 0){
                    subChildren = this.getSubChildren0(children);
                    isExit = this.checkNodeExist2(subChildren, target);
                }else if(i==1){
                    subChildren = this.getSubChildren1(children, d[0]);
                    isExit = this.checkNodeExist(subChildren, target);
                }else if(i==2){
                    subChildren = this.getSubChildren2(children, d[0], d[1]);
                    isExit = this.checkNodeExist(subChildren, target);
                }else if(i==3){
                    subChildren = this.getSubChildren3(children, d[0], d[1],d[2]);
                    isExit = this.checkNodeExist(subChildren, target);
                }

                if(!isExit){
                    if(i == 0){
                        children = this.insertChildren('', target, i, children, highLight);
                    } else if (i == 1) {
                        children = this.insertChildren(d[i - 1], target, i, children, highLight);
                    } else if (i == 2) {
                        children = this.insertChildren2(d[i - 2], d[i - 1], target, i, children, highLight);
                    } else {
                        children = this.insertChildren3(d[i - 3], d[i - 2], d[i - 1], target, i, children, highLight);
                    }
                }
            }
        }
        return children;
    }
    getChildren = (data) => {
        let children = [];
        for (let key in data) {
            const highLight = data[key]['highLight'];
            const d = data[key]['value'].split(',');
            const size = d.length;
            for (let i = 0; i < size; i++) {
                const target = d[i].trim();
                let parent = '';
                if (i > 0) {
                    parent = d[i - 1];
                }
                let subChildren = this.getSubChildren(i, children, parent);
                let isExit = this.checkNodeExist(subChildren, target);
                if (!isExit) {
                    if (i < 2) {
                        children = this.insertChildren(parent, target, i, children, highLight);
                    } else if (i == 2) {
                        children = this.insertChildren2(d[i - 2], d[i - 1], target, i, children, highLight);
                    } else {
                        children = this.insertChildren3(d[i - 3], d[i - 2], d[i - 1], target, i, children, highLight);
                    }
                } else { //节点已经存在
                    if (highLight == 1) { //更新节点的高亮
                        if (i == 0) {
                            children = this.highLightLevel1(children, target);
                        } else if (i == 1) {
                            children = this.highLightLevel2(children, target);
                        }
                    }
                }
            }
        }
        // console.log(children);
        return children;
    }
    
    getClusterName(target, existId, groupIds){
        let garr = [];
        for(let i=0;i<groupIds.length;i++){
            if(existId.indexOf(i)>-1){
                garr.push(100);
            }else{
                garr.push(Math.abs(groupIds[i].length - target));
            }
        }
        let minNum = garr[0];
        let nameIndex = 0;
        for(let i=1;i<groupIds.length;i++){
            if(garr[i]<minNum){
                minNum = garr[i];
                nameIndex = i;
            }
        }
        return nameIndex;
    }
    
    generateTreeData = (parameters) => {
        // let status = [];
        // for (let key in parameters) {
        //     status.push(true);
        // }
        // this.setState({
        //     treeDiagramShow: status
        // });

        let size = 0;
        for(let key in parameters){
            size++;
        }
        
        let data = [];
        let existId = [];
        let groupIds = this.state.scatterData.groupIDs;
        
        for (let key=0;key<size;key++) {
            let dd = parameters[key];
            
            //dd = dd.sort((a, b) => {
            //    return b['highLight'] - a['highLight'];
            //});
            if(dd){
                //let name = 'Clusters ' + (parseInt(key) + 1);
                //let name = this.getClusterName(dd);
                let nameIndex = this.getClusterName(dd.length, existId, groupIds);
                existId.push(nameIndex);
                let name = 'Clusters '+(nameIndex+1);
                data[key] = {
                    'name': name,
                    'highLight': 0,
                    'children': this.getChildren(dd)
                }
            }else{
                //let name = 'Clusters ' + (parseInt(key) + 1);
                let nameIndex = this.getClusterName(dd.length, existId, groupIds);
                existId.push(nameIndex);
                let name = 'Clusters '+(nameIndex+1);
                data[key] = {
                    'name':name,
                    //'name': 'Clusters ' + (size - key - 1),
                    'highLight': 0,
                    'children': []
                }
            }
        }
        this.setState({
            treeDiagramData: data
        });
    }

    generateTreeData2 = (parameters) => {
        let status = [];
        for (let key in parameters) {
            status.push(true);
        }
        this.setState({
            treeDiagramShow: status
        });
        let data = [];
        const size = parameters.length;
        for (let key=0;key<size;key++){
            let dd = parameters[key];
            let name = 'Clusters '+(key+1);
            data[key] = {
                'name': name,
                'highLight': 0,
                'children': this.getTreeChildren(dd)
            }
        }
        this.setState({
            treeDiagramData: data
        });
    }

    clickStep1 = (e, el) => {
        let step1tasks = this.state.step1tasks;
        let arr = [];
        let selected = [];
        let setNull = new Set();
        for (let key in step1tasks) {
            let da = step1tasks[key];
            if (el.id == da.id) {
                if (el.category == 'wip') {
                    if (da.type == '') {
                        da.type = 'primary';
                    } else {
                        da.type = '';
                    }
                } else if (el.category == 'break') {
                    el.taking.forEach(item => setNull.add(item))
                }
            } else {
                if (setNull.has(da.id) && da.type != '') {
                    da.type = '';
                }
            }
            arr.push(da);

            if (da['type'] == 'primary') {
                let val = this.convertName(da['name']);
                selected.push(val);
            }
        }
        this.setState({ 'step1tasks': arr });

        let url = apiDomain + 'step1';
        let that = this;
        axios.post(url, selected).then(function (resp) {
            if (resp.status == 200) {
                that.setState({
                    step1Data: resp.data,
                    scatterSelectedItemId: -1,
                    scatterSelectedItemData: null
                })
            }
        }).catch(function (err) {
            console.log(err);
        });
    }

    clickStep2 = () => {
        //let ids = this.state.axisareaSelected;
        const clusters = this.state.step2select;
        //const highLight = this.state.highLight;
        const highLight = this.getHighLightIDs();
        let url = apiDomain + 'passInteractions';
        let that = this;
        let parameters = {
            'clusters': clusters,
            'highLight': highLight,
            //'ids': ids,
            'ids':highLight
        };
        
        axios.post(url, parameters).then(function (resp) {
            if (resp.status == 200) {
                const centers = resp.data.centers;
                let radarImgData = [];
                for (let key in centers) {
                    let da = centers[key].map(function (value) {
                        return value;
                    });
                    let obj = {
                        'value': da,
                        // 'type': 2,
                        // 'name': 'Step 2'
                    }
                    radarImgData.push(obj);
                }
                const treedata = resp.data.treeData;
                //that.generateTreeData(treedata);
                let clusterData = resp.data.clusters;
                clusterData = clusterData.sort((a, b) => {
                    return a - b;
                });
                that.setState({
                    // step4Data: clusterData,
                    radarImgData: radarImgData,
                    // treeDataOrgin: treedata
                });
            }
        }).catch(function (err) {
            console.log(err);
        });

    }

    projectScatter = (projectType) => {
        let that = this;

        let url = apiDomain + "project_pca";
        if (projectType == "pca") {
            url = apiDomain + "project_pca";
        } else if (projectType == "mds") {
            url = apiDomain + "project_mds";
        } else if (projectType == "tsne") {
            url = apiDomain + "project_tsne";
        }

        self.setState({
            scatterSelectedItemId: -1,
            scatterSelectedItemData: null,
        });
        axios.post(url).then(function (resp) {
            if (resp.status == 200) {
                let scatter = self.state.scatterData;
                scatter.projection = resp.data.projection;
                self.setState({
                    scatterData: scatter
                });
            }
        });
    }

    getHighLightIDs() {
        const highLight = this.state.highLight;
        let selectedItems = highLight.length > 0 ? highLight : [];//this.state.step1Data;

        let ids = [];///new Set();
        if(highLight.length>0){
            for (let i = 0; i < selectedItems.length; i++) {
                const element = selectedItems[i];
                if(element && ids.indexOf(element)==-1){
                    ids.push(element);
                }
            }
            //return Array.from(ids);
        }else{
            for (let i = 0; i < selectedItems.length; i++) {
                const element = selectedItems[i];
                if(element['id']){
                    ids.push(element['id']);
                }
            }
            //return Array.from(ids);
        }
        return ids;
    }

    getNewGroup(groupIDs){
        const data = this.state.treeDataOrgin;
        const sizeArr = [];
        for(let index in data){
            sizeArr.push(data[index].length);
        }
        
        return groupIDs;
    }

    getclusterResults(numberOfCluster, clusteringType) {
        const ids = this.getHighLightIDs();
        //const ids = this.state.highLight;
        this.setState({
            'clusterNumber':numberOfCluster
        });
        let getclusterResultsUrl = apiDomain + "getclusterResults"
        let dataToBeSent = { k: numberOfCluster, selectedIds: ids, clusteringType: clusteringType };
        this.setState({
            step2select: numberOfCluster
        }, () => {
            this.clickStep2();
        });
        let that = this;
        $.ajax({
            type: "POST",
            url: getclusterResultsUrl,
            data: JSON.stringify(dataToBeSent),
            dataType: 'json',
            success: function (result) {
                let scatter = self.state.scatterData;
                scatter.groupIDs = result.groupIDs;
                //let newgroup = that.getNewGroup(result.groupIDs);
                
                //scatter.groupIDs = newgroup;
                self.setState({
                    scatterData: scatter
                });

                let buttonList = [];
                for (let i = 0; i < result.groupIDs.length; i++) {
                    buttonList.push(
                        <button className="button"
                            style={{ backgroundColor: scatterColorList[i] }}
                            onClick={(e) => self.onClickSelectScatter(e, i)}>
                            &nbsp;&nbsp;&nbsp;&nbsp;
                        </button>
                    );
                }

                self.setState({ scatterSelectButton: buttonList });
                // that.clickStep2();
                that.ajaxGetTreeData(result.groupIDs);
            }
        });
    }
    ajaxGetTreeData = (groupIDs) =>{
        const hights = this.state.highLight;
        if(hights.length>0){
            let that = this;
            let getUrl = apiDomain + "getTreeData"
            $.ajax({
                type: "POST",
                url: getUrl,
                data: JSON.stringify(groupIDs),
                dataType: 'json',
                success: function (result) {
                    that.generateTreeData2(result);
                }
            });
        }
    }
    onClickSelectScatter = (e, groupId) => {
        const parent = $(e.currentTarget).parent();
        const subelements = parent.children("button");
        subelements.removeClass("selected");
        $(e.currentTarget).addClass("selected");

        const ids = this.state.scatterData.groupIDs[groupId];
        this.onSelectedRuleListItems(ids, groupId);
    }
    hightlightTreeData = () => {
        const clusters = this.state.step2select;
        const highLight = this.state.highLight;

        let ids = this.state.axisareaSelected;
        const size = highLight.length;
        for(let i=0;i<size;i++){
            const item = highLight[i];
            ids.push(item);
        }

        let that = this;
        let parameters = {
            'clusters': clusters,
            'highLight': highLight,
            //'ids':ids,
            'ids':highLight
        };
        
        axios.post(apiDomain + 'passInteractions', parameters).then(function (resp) {
            if (resp.status == 200) {
                const centers = resp.data.centers;
                let radarImgData = [];
                for (let key in centers) {
                    let da = centers[key].map(function (value) {
                        return value;
                    });
                    let obj = {
                        'value': da,
                        // 'type': 2,
                        // 'name': 'Step 2'
                    }
                    radarImgData.push(obj);
                }
                //that.generateTreeData(resp.data.treeData);
                that.setState({
                    treeDataOrgin:resp.data.treeData
                });
            }
        }).catch(function (err) {
            console.log(err);
        });
    }

    clickStep3 = async() => {
        // await this.hightlightTreeData();
        await this.updateClustersRate(true);

    }
    getRadarOption() { //雷达图的配置
        const radarImgData = this.state.radarImgData;
        const radarRuleData = this.state.radarRuleData;
        const radarTreeData = this.state.radarTreeData;
        const radarCustimizedTreeData = this.state.radarCustimizedTreeData;
        const scatterSelectedItemData = this.state.scatterSelectedItemData;

        let seriesData = [];
        let legendData = [];

        if (radarRuleData.length > 0) {
            legendData.push('Rule');
            seriesData.push({
                name: 'Rule',
                type: 'radar',
                colorBy: 'series',
                lineStyle: {
                    width: 1,
                    opacity: 0.1
                },
                symbol: 'none',
                itemStyle: {
                    color: 'rgb(85, 26, 139)'
                },
                data: radarRuleData
            });
        }
        if (radarTreeData.length > 0) {
            legendData.push('Hovered Strategy');
            seriesData.push({
                name: 'Hovered Strategy',
                type: 'radar',
                symbol: "none",
                colorBy: 'series',
                lineStyle: {
                    width: 2,
                    opacity: 1
                },
                areaStyle: {
                    opacity: 0.0,
                },
                itemStyle: {
                    color: 'rgb(255, 0, 0)'
                },
                data: radarTreeData
            });
        }
        if (radarCustimizedTreeData.length > 0) {
            legendData.push('Customized Strategy');
            seriesData.push({
                name: 'Customized Strategy',
                type: 'radar',
                symbol: "none",
                colorBy: 'series',
                lineStyle: {
                    width: 2,
                    opacity: 1
                },
                areaStyle: {
                    opacity: 0.0,
                },
                itemStyle: {
                    color: 'rgb(0, 255, 255)'
                },
                data: radarCustimizedTreeData
            });
        }

        for (let i = 0; i < radarImgData.length; i++) {
            const itemData = radarImgData[i];
            const dataName = 'Clusters ' + (i + 1);
            legendData.push(dataName);
            seriesData.push({
                name: dataName,
                type: 'radar',
                symbol: "none",
                colorBy: 'series',
                lineStyle: {
                    width: 2,
                    opacity: 1
                },
                areaStyle: {
                    // color: '#1890ff',
                    opacity: 0.0,
                },
                itemStyle: {
                    color: scatterColorList[i]
                },
                data: [itemData]
            });
        }

        if (scatterSelectedItemData != null) {
            const radarList = ['acc', 'precision', 'recall', 'statistical', 'equal', 'disparate', 'error'];
            const allData = this.state.step1Data;

            let normalData = [];
            for (let i = 0; i < radarList.length; i++) {
                const key = radarList[i];
                const colData = allData.map(x => x[key]);
                const minVal = Math.min(...colData);
                const maxVal = Math.max(...colData);
                normalData.push((scatterSelectedItemData[key] - minVal) / (maxVal - minVal));
            }

            legendData.push('Selected Data');
            seriesData.push({
                name: 'Selected Data',
                type: 'radar',
                symbol: "none",
                colorBy: 'series',
                lineStyle: {
                    width: 2,
                    opacity: 1
                },
                areaStyle: {
                    opacity: 0.0,
                },
                itemStyle: {
                    color: '#000'
                },
                data: [normalData]
            });
        }
        return {
            legend: {
                right: 0,
                orient: 'vertical',
                data: legendData
            },
            radar: {
                // shape: 'circle',
                // splitNumber: 3,
                // center:['50%','50%'],
                // radius:'90%',
                // nameGap:5,
                id: 'radarArea',
                triggerEvent: false,
                name: {
                    textStyle: {
                        color: '#999',
                        backgroundColor: 'transparent'
                    },
                },
                axisLine: {
                    lineStyle: {
                        color: '#ddd',
                    },
                },
                splitArea: {
                    show: false,
                    areaStyle: {
                        color: '#fafafa',
                    },
                },
                indicator: [
                    { "name": "acc\n(0,1)", "max": 1 },
                    { "name": "precision\n(0,1)", "max": 1 },
                    { "name": "recall\n(0,1)", "max": 1 },
                    { "name": "statistical parity difference\n(-inf,0)", "max": 1 },
                    { "name": "equal opportunity difference\n(-inf,0)", "max": 1 },
                    { "name": "disparate\nimpact\n(0,1)", "max": 1 },
                    { "name": "error rate ratio\n(0,1)", "max": 1 },
                ],
                axisName: {
                    color: '#888',
                    fontSize: 10,
                }
            },
            series: seriesData
        };
    }

    getScatterOption() { // scatter plot
        let seriesData = [];

        if (this.state.scatterData != null
            && this.state.scatterData.projection != null
            && this.state.scatterData.groupIDs != null) {

            let projectionPoints = this.state.scatterData.projection;
            let groupIds = this.state.scatterData.groupIDs;

            seriesData.push(
                {
                    type: 'scatter',
                    color: '#CCC',
                    data: []
                }
            );
            for (let i = 0; i < groupIds.length; i++) {
                seriesData.push(
                    {
                        type: 'scatter',
                        color: scatterColorList[i],
                        data: []
                    }
                );
            }

            for (let i = 0; i < projectionPoints.length; i++) {
                const point = projectionPoints[i];
                let isFound = false
                for (let j = 0; j < groupIds.length; j++) {
                    const ids = groupIds[j];
                    if (ids.includes(i)) {
                        seriesData[j + 1].data.push([point.x, point.y, point.id])
                        isFound = true
                        break
                    }
                }
                if (!isFound) {
                    seriesData[0].data.push([point.x, point.y, point.id])
                }
            }
            if (this.state.scatterSelectedItemId >= 0) {
                // add selected dot to covert the current dot
                const point = projectionPoints[this.state.scatterSelectedItemId];

                let color = '#CCC';
                for (let j = 0; j < groupIds.length; j++) {
                    if (groupIds[j].includes(this.state.scatterSelectedItemId)) {
                        color = scatterColorList[j];
                        break;
                    }
                }
                seriesData.push(
                    {
                        type: 'scatter',
                        color: color,
                        symbolSize: 20,
                        data: [[point.x, point.y, this.state.scatterSelectedItemId]]
                    }
                );
            }
        }

        return {
            grid: {
                left: '7%',
                right: '7%',
                bottom: '7%',
                top: '3%',
                containLabel: true
            },
            xAxis: [
                {
                    type: 'value',
                    scale: true,
                    axisLabel: {
                        formatter: '{value}'
                    },
                    splitLine: {
                        show: false
                    }
                }
            ],
            yAxis: [
                {
                    type: 'value',
                    scale: true,
                    axisLabel: {
                        formatter: '{value}'
                    },
                    splitLine: {
                        show: false
                    }
                }
            ],
            series: seriesData
        }
    }

    //6.Tree View of Strategies Clusters 图形配置
    getTreeOption(index) {
        let data = this.state.treeDiagramData[index];
        return {
            series: [
                {
                    type: 'tree',
                    data: [data],
                    symbolSize: 7,
                    label: {
                        position: 'left',
                        verticalAlign: 'middle',
                        align: 'right',
                        fontSize: 9
                    },
                    leaves: {
                        label: {
                            position: 'right',
                            verticalAlign: 'middle',
                            align: 'left'
                        }
                    },
                    emphasis: {
                        focus: 'ancestor',
                        itemStyle: {
                            color: 'blue'
                        },
                    },
                    initialTreeDepth: 4,
                }
            ]
        };
    }

    //step 3
    // getStep3Option() {
    //     const step1data = this.state.step1Data;
    //     const groupIds = this.state.scatterData.groupIDs;
    //     let scatterSelectedData = null;
    //     let seriesData = [];
    //     if (groupIds != null) {
    //         for (let i = 0; i < groupIds.length; i++) {
    //             seriesData.push(
    //                 {
    //                     type: 'parallel',
    //                     lineStyle: {
    //                         width: 1
    //                     },
    //                     color: scatterColorList[i],
    //                     data: []
    //                 }
    //             );
    //         }
    //     } else {
    //         seriesData.push(
    //             {
    //                 type: 'parallel',
    //                 lineStyle: {
    //                     width: 1
    //                 },
    //                 color: "#c23531",
    //                 data: []
    //             }
    //         );
    //     }

    //     let seen = new Set();
    //     for (let key in step1data) {
    //         const d = step1data[key];
    //         if (seen.has(d['id'])) {
    //             continue
    //         }
    //         seen.add(d['id']);
    //         let obj = [d['acc'], d['precision'], d['recall'], d['statistical'], d['equal'], d['disparate'], d['error']];

    //         if (groupIds != null) {
    //             for (let j = 0; j < groupIds.length; j++) {
    //                 if (groupIds[j].includes(d['id'])) {
    //                     seriesData[j].data.push(obj);
    //                     break
    //                 }
    //             }
    //         } else {
    //             seriesData[0].data.push(obj);
    //         }
    //         if (d["id"] == this.state.scatterSelectedItemId) {
    //             scatterSelectedData = obj;
    //         }
    //     }
    //     var schema = [
    //         { name: 'acc', index: 0, text: 'acc' },
    //         { name: 'precision', index: 1, text: 'precision' },
    //         { name: 'recall', index: 2, text: 'recall' },
    //         { name: 'statistical_parity_difference', index: 3, text: 'statistical_parity_difference' },
    //         { name: 'equal_opportunity_difference', index: 4, text: 'equal_opportunity_difference' },
    //         { name: 'disparate impact', index: 5, text: 'disparate impact' },
    //         { name: 'error_rate_ratio', index: 6, text: 'error_rate_ratio' }
    //     ];

    //     if (scatterSelectedData != null) {
    //         seriesData.push({
    //             type: 'parallel',
    //             lineStyle: {
    //                 width: 5
    //             },
    //             data: [scatterSelectedData]
    //         });
    //     }
    //     console.log(seriesData);
    //     return {
    //         parallelAxis: [
    //             // { name: schema[0].text, nameLocation: 'start', scale: true },
    //             { dim: 0, name: schema[0].text, scale: true, min: 0.7, max: 0.77 },
    //             { dim: 1, name: schema[1].text, scale: true, min: 0.80, max: 0.9 },
    //             { dim: 2, name: schema[2].text, scale: true, min: 0.75, max: 0.85 },
    //             { dim: 3, name: schema[3].text, scale: true, min: -0.25, max: 0 },
    //             { dim: 4, name: schema[4].text, scale: true, min: -0.25, max: 0 },
    //             { dim: 5, name: schema[5].text, scale: true, min: 0.7, max: 1 },
    //             { dim: 6, name: schema[6].text, scale: true, min: 0, max: 0.2 }
    //         ],
    //         parallel: {
    //             left: '5%',
    //             right: '13%',
    //             bottom: '10%',
    //             top: '10%'
    //         },
    //         series: seriesData
    //     };
    // }
    getParallelColor(id, groupIds){
        let color = '#ccc';
        for(let key in groupIds){
            const da = groupIds[key];
            if(da.indexOf(parseInt(id))>-1){
                color = scatterColorList[key];
            }
        }
        return color;
    }
    getStep3Option() {
        let seriesData = [];
        const step1data = this.state.step1Data;
        const groupIds = this.state.scatterData.groupIDs;
        for(let index in step1data){
            const d = step1data[index];
            let obj = [d['acc'], d['precision'], d['recall'], d['statistical'], d['equal'], d['disparate'], d['error']];
            let tt = [];
            tt.push(obj);
            let color = this.getParallelColor(index, groupIds);
            let da = {
                type: 'parallel',
                lineStyle: {
                    width: 1
                },
                color: color,
                data:tt
            };
            seriesData.push(da);
        }
        var schema = [
            { name: 'acc', index: 0, text: 'acc' },
            { name: 'precision', index: 1, text: 'precision' },
            { name: 'recall', index: 2, text: 'recall' },
            { name: 'statistical_parity_difference', index: 3, text: 'statistical_parity_difference' },
            { name: 'equal_opportunity_difference', index: 4, text: 'equal_opportunity_difference' },
            { name: 'disparate impact', index: 5, text: 'disparate impact' },
            { name: 'error_rate_ratio', index: 6, text: 'error_rate_ratio' }
        ];
        return {
            parallelAxis: [
                // { name: schema[0].text, nameLocation: 'start', scale: true },
                { dim: 0, name: schema[0].text, scale: true, min: 0.7, max: 0.77 },
                { dim: 1, name: schema[1].text, scale: true, min: 0.80, max: 0.9 },
                { dim: 2, name: schema[2].text, scale: true, min: 0.75, max: 0.85 },
                { dim: 3, name: schema[3].text, scale: true, min: -0.25, max: 0 },
                { dim: 4, name: schema[4].text, scale: true, min: -0.25, max: 0 },
                { dim: 5, name: schema[5].text, scale: true, min: 0.7, max: 1 },
                { dim: 6, name: schema[6].text, scale: true, min: 0, max: 0.2 }
            ],
            parallel: {
                left: '5%',
                right: '13%',
                bottom: '10%',
                top: '10%'
            },
            series: seriesData
        };
    }
    changeIcon(index) {
        let treeDiagramShow = this.state.treeDiagramShow;
        treeDiagramShow[index] = !treeDiagramShow[index];
        this.setState({ 'treeDiagramShow': treeDiagramShow });
    }

    getVal = (val) => {
        if (val == 'Normalization l1') {
            return 'l1';
        }
        if (val == 'Normalization l2') {
            return 'l2';
        }
        if (val == 'PCA-3') {
            return 'PCA3';
        }
        if (val == 'PCA-5') {
            return 'PCA5';
        }
        if (val == 'MDS-3') {
            return 'max';
        }
        if (val == 'NDS-5') {
            return '';
        }
        if (val == 'Re-Weighting Algorithm') {
            return 'reweighing';
        }
        if (val == 'Disparate Impact Remover') {
            return 'DisparateImpactRemover';
        }
    }

    getNamesNode = (name, node) => {
        if (node.data.name.indexOf('Clusters') > -1 || node.data.name.indexOf('Raw Data') > -1) {
            return name;
        } else {
            name.push(this.convertName(node.data.name));
            return this.getNamesNode(name, node.parent);
        }
    }

    hoverNode = (currentNode) => {
        let that = this;
        let treeAncestors = [];
        treeAncestors = this.getNamesNode(treeAncestors, currentNode);
        treeAncestors = treeAncestors.reverse();

        let params = '[';
        for (let key in treeAncestors) {
            params += "'" + treeAncestors[key] + "',";
        }
        params = params.substring(0, params.length - 1);
        params += ']';
        const url = apiDomain + 'step6';
        let p = { 'data': params };
        axios.post(url, p).then(function (resp) {
            let data = resp.data;
            let obj = {
                'value': data,
                'type': 9,
                'name': 'Custimized '
            }
            let oldD = that.state.radarTreeData;
            let dd = [];
            for (let key in oldD) {
                const da = oldD[key];
                if (da.type != 9) {
                    dd.push(da);
                }
            }
            dd.push(obj);
            that.setState({
                radarTreeData: dd
            });
        });
    }

    nodeGenerate = (currentNode) => {
        // hoverNode(currentNode);
        let treeAncestors = [];
        treeAncestors = self.getNamesNode(treeAncestors, currentNode);
        treeAncestors = treeAncestors.reverse();

        let params = '[';
        for (let key in treeAncestors) {
            params += "'" + treeAncestors[key] + "',";
        }
        params = params.substring(0, params.length - 1);
        params += ']';
        const url = apiDomain + 'step6';
        let p = { 'data': params };
        axios.post(url, p).then(function (resp) {
            let data = resp.data;
            let obj = {
                'value': data,
                'type': 10,
                'name': 'Custimized Strategy'
            }
            let oldD = self.state.radarCustimizedTreeData;
            let dd = [];
            for (let key in oldD) {
                const da = oldD[key];
                if (da.type != 10) {
                    dd.push(da);
                }
            }
            dd.push(obj);
            self.setState({
                radarCustimizedTreeData: dd
            });
        });
    }

    getRoadMap2 = (arr) => {
        let that = this;
        let params = '[';
        const size = arr.length;
        for (let key = size - 1; key >= 0; key--) {
            const val = this.getVal(arr[key].trim());
            params += "'" + val + "',";
        }
        params = params.substring(0, params.length - 1);
        params += ']';
        const url = apiDomain + 'step6';
        let p = { 'data': params };
        axios.post(url, p).then(function (resp) {
            let data = resp.data;
            let obj = {
                'value': data,
                'type': 6,
                'name': 'Step 6'
            }
            let oldD = that.state.radarImgData;
            let dd = [];
            for (let key in oldD) {
                const da = oldD[key];
                if (da.type != 6) {
                    dd.push(da);
                }
            }
            dd.push(obj);
            that.setState({
                radarImgData: dd
            });
        });
    }

    getRoadMap = (arr) => {
        let that = this;
        let params = '[';
        const size = arr.length;
        for (let key = size - 1; key >= 0; key--) {
            const val = this.getVal(arr[key].trim());
            if (typeof val != 'undefined') {
                params += "'" + val + "',";
            }
        }
        params = params.substring(0, params.length - 1);
        params += ']';
        const url = apiDomain + 'step6';
        let p = { 'data': params };
        axios.post(url, p).then(function (resp) {
            let data = resp.data;
            let obj = {
                'value': data,
                'type': 7,
                'name': 'Step 7'
            }
            let oldD = that.state.radarImgData;
            let dd = [];
            for (let key in oldD) {
                const da = oldD[key];
                if (da.type != 7) {
                    dd.push(da);
                }
            }
            dd.push(obj);
            that.setState({
                radarImgData: dd
            });
        });
    }

    checkLineData = (arr, flag, target) => {
        const max = arr[1];
        const min = arr[0];
        let a = 0;
        switch (flag) {
            case '\x00acc\x00':
                a = target['acc'];
                break;
            case '\x00precision\x00':
                a = target['precision'];
                break;
            case '\x00recall\x00':
                a = target['recall'];
                break;
            case '\x00statistical_parity_difference\x00':
                a = target['statistical'];
                break;
            case '\x00equal_opportunity_difference\x00':
                a = target['equal'];
                break;
            case '\x00disparate_impact\x00':
                a = target['disparate'];
                break;
            case '\x00error_rate_ratio\x00':
                a = target['error'];
                break;
        }
        if (a >= min && a <= max) {
            return true;
        } else {
            return false;
        }
    }

    onEvents = {
        'axisareaselected': this.onChartAxisareaSelected.bind(this)
    }

    onChartAxisareaSelected(param, self) {
        let hight = [];
        // var series0 = self.getModel().getSeries()[0];
        // var series1 = self.getModel().getSeries()[1];
        // var indices0 = series0.getRawIndicesByActiveState('active');
        // var indices1 = series1.getRawIndicesByActiveState('active');
        // const groupIds = this.state.scatterData.groupIDs;
        // var group0 = groupIds[0];
        // var group1 = groupIds[1];
        
        // for(let item in indices0){
        //     hight.push(group0[item]);
            
        // }
        // for(let item in indices1){
        //     hight.push(group1[item]);
        // }
        const series = self.getModel().getSeries();
        for(let i=0;i<100;i++){
            const serie = series[i];
            const length = serie.getRawIndicesByActiveState('active').length;
            if(length > 0){
                hight.push(i);
            }
        }
        this.setState({
            highLight: hight,
            axisareaSelected: hight
        }); 
    }

    getTimeTxt() {
        let timeApiUrl = apiDomain + 'time'
        let self = this;
        $.ajax({
            dataType: "json",
            url: timeApiUrl,
            success: function (result) {
                self.setState({ timeTxt: result.time })
            },
            error: function (data) {
                console.log(data);
            }
        });
    }


    onSelectedRuleListItems(ids, groupId) {

        // document.querySelector("#selectedCluster").innerHTML = "Hovered cluster " + (groupId + 1);

        // Update circle node
        // const circleNodes = document.querySelectorAll("#circlesArea circle");
        // for (let i = 0; i < circleNodes.length; i++) {
        //     circleNodes[i].setAttribute('fill', 'rgba(100, 100, 100, 0.5)');
        // }

        // send to learn rule
        let learnRulesUrl = apiDomain + "learnRules"
        let dataToBeSent = { selectedIds: ids };
        console.log(dataToBeSent);
        $.ajax({
            type: "POST",
            url: learnRulesUrl,
            data: JSON.stringify(dataToBeSent),
            dataType: 'json',
            success: function (result) {
                let ml_result = result.ml_result_std;
                ml_result.eachRules = [ml_result.eachRules.find(x => x.pred_label == 1)];
                self.setState({
                    'ruleStdResultData': ml_result
                });
            }
        });
    }

    onUpdatedRuleValue(self, rule, ruleItemsData) {
        function cleanUpTree(treeNode) {
            for (let i = 0; i < treeNode.children.length; i++) {
                treeNode.children[i].highLight = 0;
                cleanUpTree(treeNode.children[i])
            }
        }

        // count min - max ranges for radar
        // this.state.radarRuleData;


        // { "name": "acc", "max": 1 },
        // { "name": "precision", "max": 1 },
        // { "name": "recall", "max": 1 },
        // { "name": "statistical_parity_difference", "max": 1 },
        // { "name": "equal_opportunity_difference", "max": 1 },
        // { "name": "disparate_impact", "max": 1 },
        // { "name": "error_rate_ratio", "max": 10 },
        // count radar range
        const radarList = ["acc", "precision", "recall", "statistical_parity_difference", "equal_opportunity_difference", "disparate_impact", "error_rate_ratio"];
        // `radarDataRange` includes [[min point, max point]] for each feature, 0.2 as default
        let radarDataRange = [[0.2, 0.2], [0.2, 0.2], [0.2, 0.2], [0.2, 0.2], [0.2, 0.2], [0.2, 0.2], [0.2, 0.2]];
        // `radarPoints` to address point in canvas in case for the plan B
        const radarPoints = [[[301, 258.984375], [299, 74.984375]], [[335, 274.984375], [475, 160.984375]], [[341, 310.984375], [519, 350.984375]], [[319, 342.984375], [397, 506.984375]], [[283, 340.984375], [203, 506.984375]], [[259, 312.984375], [81, 350.984375]], [[265, 276.984375], [123, 160.984375]]];

        let matchedData = ruleItemsData;
        for (let key in rule) {
            if (key == 'label') {
                continue;
            }
            matchedData = matchedData.filter(item =>
                (rule[key][2] === '(' ? item[key] > rule[key][0] : item[key] >= rule[key][0]) &&
                (rule[key][3] === ')' ? item[key] < rule[key][1] : item[key] <= rule[key][1]))

            // update radar range
            const index = radarList.indexOf(key);
            const rawDataForKey = ruleItemsData.map(x => x[key]);
            const minVal = Math.min(...rawDataForKey);
            const maxVal = Math.max(...rawDataForKey);

            if (rule[key][0] != Infinity && rule[key][0] != -Infinity) {
                radarDataRange[index][0] = (rule[key][0] - minVal) / (maxVal - minVal);
            } else {
                radarDataRange[index][0] = 0;
            }
            if (rule[key][1] != Infinity && rule[key][1] != -Infinity) {
                radarDataRange[index][1] = (rule[key][1] - minVal) / (maxVal - minVal);
            } else {
                radarDataRange[index][1] = 1;
            }
        }

        // set radarRuleData
        let updatedRadarRuleData = [];
        const numberOfLines = 100;

        // create data for each radar feature - `p`
        // in each feature line, only the `p` will have value and others will be 0.2 to create the cricle
        // in each feature, create `c` = 10 lines, to make it looks like filled area
        for (let p = 0; p < radarList.length; p++) {
            const minFeaturePoint = radarDataRange[p][0];
            const maxFeaturePoint = radarDataRange[p][1];

            for (let c = 0; c < numberOfLines; c++) {
                const poi = ((maxFeaturePoint - minFeaturePoint) / numberOfLines * c + minFeaturePoint);
                let row = [];
                for (let i = 0; i < radarList.length; i++) {
                    row.push(i == p ? poi : 0.2);
                }
                updatedRadarRuleData.push(row);
            }
            // let row = [];
            // for (let i = 0; i < radarList.length; i++) {
            //     row.push(i == p ? radarDataRange[i][0] : 0.2);
            // }
            // updatedRadarRuleData.push(row);

            // row = [];
            // for (let i = 0; i < radarList.length; i++) {
            //     row.push(i == p ? radarDataRange[i][1] : 0.2);
            // }
            // updatedRadarRuleData.push(row);

            // let setOfData = {
            //     name: '',
            //     type: 'radar',
            //     colorBy: 'series',
            //     lineStyle: {
            //         width: 2,
            //         opacity: 0.5
            //     },
            //     symbol: 'none',
            //     itemStyle: {
            //         color: 'rgb(85, 26, 139)'
            //     },
            //     data: seriesData
            // }
            // updatedRadarRuleData.push(setOfData);
        }


        self.setState({
            radarRuleData: updatedRadarRuleData
        });

        // // here is plan B to darw path and filled in the canvas
        // const canvas = document.querySelector("#radarArea canvas");
        // if (canvas.getContext) {
        //     const ctx = canvas.getContext('2d');
        //     ctx.beginPath();

        //     let allLowPoints = [];
        //     let allHiPoints = [];

        //     for (let i = 0; i < radarDataRange.length; i++) {
        //         const lowPrecentage = radarDataRange[i][0];
        //         const hiPrecentage = radarDataRange[i][1];

        //         const lowX = radarPoints[i][0][0];
        //         const lowY = radarPoints[i][0][1];
        //         const hiX = radarPoints[i][1][0];
        //         const hiY = radarPoints[i][1][1];

        //         const lowCurrentX = (hiX - lowX) * lowPrecentage + lowX;
        //         const lowCurrentY = (hiY - lowY) * lowPrecentage + lowY;
        //         const hiCurrentX = (hiX - lowX) * hiPrecentage + lowX;
        //         const hiCurrentY = (hiY - lowY) * hiPrecentage + lowY;

        //         allLowPoints.push([lowCurrentX, lowCurrentY]);
        //         allHiPoints.push([hiCurrentX, hiCurrentY]);
        //     }

        //     for (let i = 0; i < allLowPoints.length; i++) {
        //         if (i == 0) {
        //             ctx.moveTo(allLowPoints[i][0], allLowPoints[i][1]);
        //         } else {
        //             ctx.lineTo(allLowPoints[i][0], allLowPoints[i][1]);
        //         }
        //     }
        //     ctx.lineTo(allLowPoints[0][0], allLowPoints[0][1]);

        //     ctx.lineTo(allHiPoints[0][0], allHiPoints[0][1]);
        //     allHiPoints.reverse();
        //     for (let i = 0; i < allHiPoints.length; i++) {
        //         ctx.lineTo(allHiPoints[i][0], allHiPoints[i][1]);
        //     }
        //     ctx.fillStyle = "rgba(85, 26, 139, 0.5)";
        //     ctx.fill();
        // }






        // handle update circles
        // console.log(self.state.bubbleDiagramOption.groups);
        const groups = self.state.bubbleDiagramOption.groups;
        // let numberOfMatchedInGroups = new Array(groups.length).fill(0);

        var updatedTreeData = self.state.treeDiagramData;

        for (let i = 0; i < groups.length; i++) {
            if (updatedTreeData[i] == undefined) {
                continue;
            }
            // clean up
            cleanUpTree(updatedTreeData[i]);

            // const matchedGroupItems = groups[i].filter(gid => matchedData.some(item => item['id'] == gid));
            const matchedGroupItems = matchedData.filter(item => groups[i].some(gid => item['id'] == gid));

            // numberOfMatchedInGroups[i] = matchedGroupItems.length;
            const coverage = matchedGroupItems.length / groups[i].length;

            //purple
            const r = 100 + (85 - 100) * coverage;
            const g = 100 + (26 - 100) * coverage;
            const b = 100 + (139 - 100) * coverage;

            //Orange
            // const r = 100 + (255 - 100) * coverage;
            // const g = 100 + (165 - 100) * coverage;
            // const b = 100 + (0 - 100) * coverage;

            // const circleNode = document.querySelector("#circlesArea circle[groupId='" + i + "']");
            // circleNode.setAttribute('fill', 'rgba(' + r + ', ' + g + ', ' + b + ', 0.6)');

            // update tree
            for (let j = 0; j < matchedGroupItems.length; j++) {
                const tags = eval(matchedGroupItems[j]['tags']);
                if (tags == undefined) {
                    break;
                }
                var currentTreeData = updatedTreeData[i];
                if (currentTreeData == undefined) {
                    break;
                }
                for (let k = 0; k < tags.length; k++) {
                    const matches = currentTreeData.children.filter(item => item.name == tags[k]);
                    if (matches.length <= 0) {
                        break;
                    }

                    currentTreeData = matches[0];
                    currentTreeData.highLight = 1;
                }

            }

        }

        // console.log(updatedTreeData);
        self.setState({
            treeDiagramData: updatedTreeData
        });

        // handle update tree

    }

    // changeHighLightNode(params) {
    //     const data = this.state.treeDataOrgin;
    //     let target = {};
    //     for(let key in data){
    //         let val = data[key];
    //         let v2 = [];
    //         for(let item in val){
    //             //let obj = {highLight: 0, value: item['value']};
    //             let obj = {highLight: 0, value: val[item]['value']};
    //             v2.push(obj);
    //         }
    //         target[key] = v2;
    //     }
    //     console.log(target);
    //     const url = apiDomain + 'hightLightTree';
    //     const parameters = {
    //         "data":target,
    //         "highLight":params.id
    //     };
    //     const that = this;
    //     axios.post(url, parameters).then(function (resp) {            
    //         if (resp.status == 200) {
    //             const data = resp.data.data;
    //             // that.generateTreeData(data);
    //             that.setState({
    //                 treeDataOrgin: data
    //             });          
    //         }
    //     }).catch(function (err) {
    //     });
    // }
    resetChildrenLevel4(data){
        let arr = [];
        for(let i=0;i<data.length;i++){
            const da = data[i];
            da['highLight'] = 0;
            arr.push(da);
        }
        return arr;
    }

    resetChildrenLevel3(data){
        let arr = [];
        for(let i=0;i<data.length;i++){
            const da = data[i];
            da['highLight'] = 0;
            da['children'] = this.resetChildrenLevel4(da['children']);
            arr.push(da);
        }
        return arr;
    }

    resetChildrenLevel2(data){
        let arr = [];
        for(let i=0;i<data.length;i++){
            const da = data[i];
            da['highLight'] = 0;
            da['children'] = this.resetChildrenLevel3(da['children']);
            arr.push(da);
        }
        return arr;
    }
    
    resetChildrenLevel1(data){
        let arr = [];
        for(let i=0;i<data.length;i++){
            const da = data[i];
            da['highLight'] = 0;
            da['children'] = this.resetChildrenLevel2(da['children']);
            arr.push(da);
        }
        return arr;
    }
    resetTreeHighLight(){
        const target = this.state.treeDiagramData;
        let newarr = [];
        if(target.length>0){
            for(let index in target){
                let da = target[index];
                da['highLight'] = 0;
                let children = da['children'];
                da['children'] = this.resetChildrenLevel1(children);
                newarr.push(da);
            }
        }
    }

    changeHighLightNode(params, index) {
        const id = params.id;
        const url = apiDomain + 'hightLightTree';
        const parameters = {
            "id":id
        };
        const that = this;
        this.resetTreeHighLight();
        axios.post(url, parameters).then(function (resp) {
            if (resp.status == 200) {
                const rst = resp.data.split(',');
                const target = that.state.treeDiagramData;
                let arr = [];
                let status = [];
                const size = target.length;
                if(size > 0){
                    for(let i in target){
                        if(i==index){
                            let newarr = target[i];
                            newarr['highLight'] = 1;
                            let level1 = 0;
                            let level2 = 0;
                            let level3 = 0;
                            for(let k=0;k<rst.length;k++){
                                const da = rst[k].trim();
                                if(k==0){
                                    let children = newarr['children'];
                                    for(let item in children){
                                        if(children[item]['name'].trim()==da){
                                            newarr['children'][item]['highLight'] = 1;
                                            level1 = item;
                                        }
                                    }
                                }
                                if(k==1){
                                    let children = newarr['children'][level1]['children'];
                                    for(let item in children){
                                        if(children[item]['name'].trim()==da){
                                            newarr['children'][level1]['children'][item]['highLight'] = 1;
                                            level2 = item;
                                        }
                                    }
                                }

                                if(k==2){
                                    let children = newarr['children'][level1]['children'][level2]['children'];
                                    for(let item in children){
                                        if(children[item]['name'].trim()==da){
                                            newarr['children'][level1]['children'][level2]['children'][item]['highLight'] = 1;
                                            level3 = item;
                                        }
                                    }
                                }
                            }
                            arr.push(newarr);
                            status.push(false);
                        }else{
                            arr.push(target[i]);
                            status.push(tree);
                        }
                    }
                    that.setState({
                        treeDiagramShow: status
                    });
                }
            }
        }).catch(function (err) {

        });
    }

    render() {
        let stepButtons = [];
        const lcub = String.fromCharCode(123);
        const rcub = String.fromCharCode(125);

        this.state.step1tasks.forEach((el) => {
            // console.log(el.name);

            if (el.category == 'break') {
                if (stepButtons.length > 0) {

                    stepButtons.push(<span>{rcub}</span>);
                    stepButtons.push(<span>&</span>);
                }
                stepButtons.push(<span>{lcub}</span>);
            }

            stepButtons.push(
                <div className='item'>
                    <Button
                        size='small'
                        shape='round'
                        key={el.id}
                        type={el.type}
                        danger={el.danger}
                        onClick={(e) => this.clickStep1(e, el)}
                    >
                        {el.name}
                    </Button>
                </div>
            );
        });
        stepButtons.push(<span>{rcub}</span>);

        //step7Btns
        let step7Btns = [];
        this.state.step7Tasks.forEach((el) => {
            step7Btns.push(
                <Button
                    shape='round'
                    key={el.id}
                    type={el.type}
                    danger={el.danger}
                    onDragStart={(e) => this.onDragStart(e, el.id, el.name)}
                    draggable>
                    {el.name}
                </Button>);
        });
        const that = this;
        // let onEvents = {
        //     'click':(e)=>{},
        //     'mouseup':(e)=>{
        //     },
        //     'mouseover':(e)=>{
        //         const treeAncestors = e.treeAncestors;
        //         let params = '[';
        //         for(let key in treeAncestors){
        //             if(key>1){
        //                 params += "'"+treeAncestors[key].name.trim()+"',";
        //             }
        //         }
        //         params = params.substring(0, params.length-1);
        //         params += ']';

        //         const url = apiDomain + 'step6';
        //         let p = {'data':params};
        //         axios.post(url, p).then(function(resp){
        //             let data = resp.data;
        //             let oldD = that.state.radarImgData;
        //             oldD.unshift();
        //             oldD.push(data);
        //             // that.setState({
        //             //     radarImgData:oldD
        //             // });
        //         });
        //     }
        // };

        const treeOptions = this.state.treeDiagramShow.map((ele, index) => {
            let title = 'cluster '+(index+1);
            if (ele) {
                return (
                    <div className='tree'>
                        <div className='bt' onClick={() => {
                            that.changeIcon.call(this, index);
                        }}>
                            <PlusSquareOutlined />{title}
                        </div>
                    </div>
                )
            } else {
                const info2 = {
                    data: that.state.treeDiagramData[index],
                    //width: 1300,
                    width: that.state.screenWidth,
                    height: 1100
                };
                return (
                    <div className='tree'>
                        <div className='bt' onClick={() => {
                            that.changeIcon.call(this, index);
                        }}>
                            <MinusSquareOutlined />{title}
                        </div>
                        <TreeMap2 hoverNode={this.hoverNode} getRoadMap={this.getRoadMap2} {...info2} />
                        {/* <ReactEcharts
                             onEvents={onEvents}
                             option={this.getTreeOption(index)}
                             notMerge={true}
                             lazyUpdate={true}
                             style={{width: '100%',height:'300px'}}
                         /> */}
                    </div>
                )
            }
        });

        const bubbleDiagramOption = {
            data: this.state.step4Data,
            width: 200,
            height: 200
        };

        function scatterOnClick(param) {
            if (param.componentType == "series") {
                // index id
                const indexId = param.data[2]
                let selectedItem = self.state.step1Data.find(x => x["id"] == indexId);
                self.setState({
                    scatterSelectedItemId: indexId,
                    scatterSelectedItemData: selectedItem
                })
                self.changeHighLightNode(selectedItem, param.seriesIndex-1);
            }
        }

        return (
            <div id="main">
                <ReactTooltip id='first_tip' place="bottom" type="dark" effect="solid">
                    <span>The Parallel Coordinates View shows the performance of all available strategies. You can select/unselect operations on the top to include/exclude strategies containing those operations in the PC view. If you select “none” in each pair of brackets, it means you want strategies with no operations of such kind.(e.g. Selecting “none” in normalization means strategies that don't include any normalization operation will be shown in the PC view.)

                        You can clip range filters to get rid of unqualified strategies. Upon clicking on “highlight qualified strategies” button, qualified strategies will be marked in red in the 4. Tree view.

                        Hereby we illustrate the meaning of each bias metric:
                        Accuracy indicates the ratio of corrected predicted instances among the entire dataset.
                        Precision indicates the ratio of True Positives over all predicted positives.
                        Recall Indicates the measure of the model correctly identifying True Positives over all predicted positives.
                        Statistical Parity Difference indicates the probability difference for a protected member to be predicted as positive compared to a privileged member.
                        Equal Opportunity Difference measures the difference of true positive rates between the protected group and  the privileged group.
                        Disparate Impact measures the ratio difference of the positively predicted rate between the protected group and the privileged group.
                        Error Rate Ratio measures the ratio difference of predictive error rate between the protected group and the privileged group.</span>
                </ReactTooltip>
                <ReactTooltip id='sec_tip' place="bottom" type="dark" effect="solid">
                    <span>Choose the number of clusters, and click on the “generate clusters” button, all strategies will be grouped into a few clusters according to the model performance when applying them on the dataset. The performance of the centroids of each cluster is shown in the radar plot.
                    </span>
                </ReactTooltip>
                <ReactTooltip id='third_tip' place="bottom" type="dark" effect="solid">
                    <span> By clicking on each cluster in Section2, a rule list will be generated to show how the cluster you select is different from others. The rule will also be reflected in the radar plot. You can adjust the slider in the rule view, the concentration of the clusters indicates the numbers of strategies in each cluster which qualifies the current rule. </span>
                </ReactTooltip>
                <ReactTooltip id='six_tip' place="bottom" type="dark" effect="solid">
                    <span>You will see strategies in each cluster presented in the form of a tree view. Each branch of the tree view indicates a series of pre-processing operations applied on the datasets. By hovering on each node, on the radar plot you will see the performance of applying this strategy on the dataset using the provided model.
                    </span>
                </ReactTooltip>
                <ReactTooltip id='seventh_tip' place="bottom" type="dark" effect="solid">
                    <span>You can click on the root node to create new empty child nodes. By dragging the operations from above into the empty slot, you can build your customized pre-processing strategy. Clicking on the leaf node of your strategy you will find a “generate” button. Clicking on it you will see the performance of the current strategy in the radar plot.
                    </span>
                </ReactTooltip>
                <div id="main-container">
                    <div className="top">
                        <h2>PREtzel</h2>
                        <span>Audit Algorithmic Bias Caused By Pre-processing</span>
                    </div>
                    <div className="other">
                        <div className="other-left">
                            <div className="step1">
                                <div className="title">
                                    <div className="text">1.Pre-processing Operation Filter Panel <a data-tip data-for='first_tip' style={{ color: 'black' }}> <QuestionCircleOutlined /> </a> </div>
                                </div>
                                <div className="content">
                                    {stepButtons}
                                </div>
                                <div className='graphics'>
                                    <ReactEcharts
                                        option={this.getStep3Option()}
                                        onEvents={this.onEvents}
                                        style={{ width: '100%', height: this.state.step1Height }}
                                    />
                                    <div style={{ textAlign: 'right' }}>
                                        <Button type="primary" size='small' onClick={() => this.clickStep3()}>Finish filtering</Button>
                                    </div>
                                </div>
                            </div>

                            <div className="step2">
                                <div className="title">
                                    <div className="text">2.Clusters and Radar Plot View <a data-tip data-for='sec_tip' style={{ color: 'black' }}> <QuestionCircleOutlined /> </a></div>
                                </div>
                                <div className="content scroll" style={{ 'height': this.state.step2Height }}>
                                    <div className="content-l" style={{ zIndex: 999 }}>
                                        <div>
                                            {/* <Button type="primary" onClick={() => this.clickSelectScatter()}>Selection</Button> */}
                                            <PopupScatterSelection
                                                mainAppDelegate={this}
                                                clusterRate={this.state.clusterRate} />
                                        </div>
                                        <div id="scatterArea">
                                            <ReactEcharts
                                                option={this.getScatterOption()}
                                                notMerge={true}
                                                lazyUpdate={true}
                                                style={{ width: '480px', height: '320px' }}
                                                onEvents={{
                                                    'click': scatterOnClick
                                                }}
                                            />
                                        </div>
                                        <div>

                                        </div>
                                        {/* <div style={{ float: 'left' }}>
                                            <BubbleDiagram onSelectHandle={this.onSelectedRuleListItems} {...this.state.bubbleDiagramOption} />
                                        </div>
                                        <div style={{ width: '75px', float: 'right' }}>
                                            <img style={{ width: '100%' }} src={require('./assets/heatmapLabel.png')} />
                                        </div> */}
                                    </div>
                                    <div className='content-right' id="radarArea" style={{ width: '60%' }}>
                                        <ReactEcharts
                                            option={this.getRadarOption()}
                                            notMerge={true}
                                            lazyUpdate={true}
                                            style={{ width: '480px', height: '320px' }}
                                        />
                                        <div id="radarNote">
                                            <strong>Note:</strong> Every cluster in the radar chart indicates the centroid strategy's performance of that cluster.
                                            <br />The shaded purple area reflects the rule space of the selected cluster.
                                        </div>
                                        <div id="radarCover">
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {/* <div className="step3">
                                <div className="title">
                                    <div className="text">3.Filter clusters on coordinates <QuestionCircleOutlined /></div>

                                </div>
                                <div className="content">
                                    <ReactEcharts
                                        option={this.getLineOption()}
                                        notMerge={true}
                                        lazyUpdate={true}
                                        style={{ width: '200vh', height: '100vh' }}
                                    />
                                    <Button type="primary" onClick={() => this.clickStep3()}>Update Clusters</Button>
                                </div>
                            </div> */}
                            <div className="step4">
                                <div className="title">
                                    <div className="text">3. Rule view <a data-tip data-for='third_tip' style={{ color: 'black' }}> <QuestionCircleOutlined /> </a>
                                        <div id="scatterSelectButtonArea"> {this.state.scatterSelectButton} </div>
                                    </div>
                                    {/* <div className="text">4.Clusters View<QuestionCircleOutlined /></div> */}
                                </div>
                                <div className="content">
                                    <div className="content">
                                        {/* <BubbleDiagram onSelectHandle={this.onSelectedRuleListItems} {...this.state.bubbleDiagramOption} /> */}
                                    </div>
                                    <div className='content scroll scrollx' style={{ 'height': this.state.step3Height + 300 }}>
                                        {/* <div className='content-left' style={{ width: '40%', marginRight: '40px', maxWidth: '280px' }}> */}
                                        {/* <div className='content'> */}
                                        <RuleListComponment onUpdatedRuleValue={this.onUpdatedRuleValue} {...{ ruleItemsData: ruleItemsData, mlStdResult: this.state.ruleStdResultData, parentComponment: this }} />
                                        {/* </div> */}

                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="other-right">
                            <div className="step6">
                                <div className="title">
                                    <div className="text" style={{ width: '100%' }}>4.Tree View of Strategy Clusters <a data-tip data-for='six_tip' style={{ color: 'black' }}> <QuestionCircleOutlined /> </a></div>
                                </div>
                                <div className="content">
                                    <div className='scroll' style={{ "height": this.state.contentRightHeight1 }}>
                                        {treeOptions}
                                    </div>

                                </div>
                            </div>
                            <div className="step7">
                                <div className="title" >
                                    <div className="text" style={{ width: '100%' }}>5.Customization View<a data-tip data-for='six_tip' style={{ color: 'black' }}> <QuestionCircleOutlined /> </a></div>
                                </div>
                                <div className="content">

                                    {/* <div className='scroll'> */}
                                    <div className="wip" onDragOver={(e) => this.onDragOver(e)} style={{ "height": '40px' }}>
                                        {step7Btns}
                                    </div>
                                    <div id='strategiesTreeArea' className='scroll' style={{ 'height': this.state.contentRightHeight2 }}>
                                        <div className="droppable" onDragOver={(e) => this.onDragOver(e)} >
                                            <TreeMap generate={this.nodeGenerate} getRoadMap={this.getRoadMap} {...this.treeInfo} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div >
        );
    }
}

export default App;
