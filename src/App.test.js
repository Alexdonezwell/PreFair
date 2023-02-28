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

const apiDomain = "http://localhost:5000/";
const mytextStyle = {
  color: "#333",
  fontStyle: "normal",
  fontWeight: "normal",
  // fontFamily:"sans-serif",
  fontSize: 12,
};
const { Option } = Select;
var self = undefined;

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
      { id: 1, name: "Normalization l1", category: "wip", type: 'primary' },
      { id: 2, name: "Normalization l2", category: "wip", type: 'primary' },
      { id: 3, name: "PCA-3", category: "wip", type: 'primary' },
      { id: 4, name: "PCA-5", category: "wip", type: 'primary' },
      { id: 5, name: "MDS-3", category: "wip", type: 'primary' },
      { id: 6, name: "MDS-5", category: "wip", type: 'primary' },
      { id: 7, name: "Re-Weighting Algorithm", category: "wip", type: 'primary' },
      { id: 8, name: "Disparate Impact Remover", category: "wip", type: 'primary' },
    ],
    step7Tasks: [
      { id: 1, name: "Normalization l1", category: "wip", type: '' },
      { id: 2, name: "Normalization l2", category: "wip", type: '' },
      { id: 3, name: "PCA-3", category: "wip", type: '' },
      { id: 4, name: "PCA-5", category: "wip", type: '' },
      { id: 5, name: "MDS-3", category: "wip", type: '' },
      { id: 6, name: "NDS-5", category: "wip", type: '' },
      { id: 7, name: "Re-Weighting Algorithm", category: "wip", type: '' },
      { id: 8, name: "Disparate Impact Remover", category: "wip", type: '' },
    ],
    step4Data: [],
    step2select: 3,
    radarImgData: [],
    treeImgData: [],
    selectedData: [],
    treeDiagramShow: [], //控制显示隐藏
    treeDiagramData: [],
    timeTxt: "",
    clusterResult: [],
    bubbleDiagramOption: {
      data: [1000, 2000, 3000],
      groups: [[0], [1], [2]],
      width: 300,
      height: 300
    },
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
    }
  }
  treeInfo = {
    data: data,
    width: '100%',
    height: this.state.step3Height
  }

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
        that.setState({
          step1Data: resp.data
        })
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
    this.getclusterResults();
  }

  updateWindowDimensions() {
    const height1 = (window.innerHeight - 150) * 0.7;
    const height2 = (window.innerHeight - 150) * 0.3;
    const height = (window.innerHeight - 150) * 0.5;
    const step1height = height - 50;
    const step2height = height / 2 - 30;
    const step3height = height / 2 - 30;

    self.setState({
      contentRightHeight1: height1 + 'px',
      contentRightHeight2: height2 + 'px',
      step1Height: step1height + 'px',
      step2Height: step2height,
      step3Height: step3height,
    });
  }

  onDragStart = (ev, id, name) => {
    ev.dataTransfer.setData("name", name);
  }
  onDragOver = (ev) => {
    ev.preventDefault();
  }
  handleChange = (val) => {
    this.setState({ 'step2select': val });
  }
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
      for (let key2 in detail) {
        const name = detail[key2]['name'].trim();
        if (name == target) {
          children[key]['children'][key2]['highLight'] = 1;
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

  generateTreeData = (parameters) => {
    let status = [];
    for (let key in parameters) {
      status.push(true);
    }
    this.setState({
      treeDiagramShow: status
    });

    let data = [];
    for (let key in parameters) {
      let dd = parameters[key];
      dd = dd.sort((a, b) => {
        return b['highLight'] - a['highLight'];
      });
      data[key] = {
        'name': 'Clusters ' + (parseInt(key) + 1),
        'highLight': 1,
        'children': this.getChildren(dd)
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
    for (let key in step1tasks) {
      let da = step1tasks[key];
      if (el.id == da.id) {
        if (el.type == '') {
          el.type = 'primary';
        } else {
          el.type = '';
        }
      }
      arr.push(da);
    }
    for (let key in step1tasks) {
      const da = step1tasks[key];
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
          step1Data: resp.data
        })
      }
    }).catch(function (err) {
      console.log(err);
    });
  }

  clickStep2 = () => {
    const clusters = this.state.step2select;
    const highLight = this.state.highLight;
    let url = apiDomain + 'passInteractions';
    let that = this;
    let parameters = {
      'clusters': clusters,
      'highLight': highLight
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
            'type': 2,
            'name': 'Step 2'
          }
          radarImgData.push(obj);
        }
        that.generateTreeData(resp.data.treeData);
        let clusterData = resp.data.clusters;
        clusterData = clusterData.sort((a, b) => {
          return a - b;
        });
        that.setState({
          step4Data: clusterData,
          radarImgData: radarImgData
        });
      }
    }).catch(function (err) {
      console.log(err);
    });

  }

  clickStep3 = () => {
    this.clickStep2();
  }
  getBarOption() { //雷达图的配置
    const radarImgData = this.state.radarImgData;
    return {
      legend: {
        data: ['Step 2', 'Step 6', 'Step 7']
      },
      radar: {
        shape: 'circle',
        // splitNumber: 3,
        // center:['50%','50%'],
        // radius:'90%',
        // nameGap:5,
        triggerEvent: true,
        name: {
          textStyle: {
            color: '#999',
            backgroundColor: 'transparent'
          },
          formatter: function (value, indicator) {
            value = value.replace(/\S{4}/g, function (match) {
              return match + '\n'
            });
            return '{a|' + value + '}';
          },
          rich: {
            a: {
              color: "#999",
              fontSize: 12,
              align: "center"

            },
            b: {
              color: "#333",
              fontSize: 17,
              align: "center"
            }
          }
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
          { "name": "acc", "max": 1 },
          { "name": "precision", "max": 1 },
          { "name": "recall", "max": 1 },
          { "name": "statistical_parity_difference", "max": 1 },
          { "name": "equal_opportunity_difference", "max": 1 },
          { "name": "disparate_impact", "max": 1 },
          { "name": "error_rate_ratio", "max": 10 },
        ],
      },
      series: [{
        name: '',
        type: 'radar',
        symbol: "none",
        //显示雷达图选中背景
        areaStyle: { normal: {} },
        data: radarImgData
      }]
    };
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
  getStep3Option() {
    const step1data = this.state.step1Data;
    let data = [];
    for (let key in step1data) {
      const d = step1data[key];
      let obj = [d['acc'], d['precision'], d['recall'], d['statistical'], d['equal'], d['disparate'], d['error']];
      data.push(obj);
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
      color: ['#c23531', '#91c7ae', '#dd8668'],
      legend: {
        top: 10,
        itemGap: 20
      },
      parallelAxis: [
        {
          name: schema[0].text,
          inverse: true,
          nameLocation: 'start'
        },
        { dim: 1, name: schema[1].text },
        { dim: 2, name: schema[2].text },
        { dim: 3, name: schema[3].text },
        { dim: 4, name: schema[4].text },
        { dim: 5, name: schema[5].text },
        { dim: 6, name: schema[6].text }
      ],
      parallel: {
        left: '5%',
        right: '13%',
        bottom: '10%',
        top: '10%'
      },
      series: {
        type: 'parallel',
        lineStyle: {
          width: 1
        },
        data: data
      }
    };
  }

  getLineOption() {
    var dataBJ = [
      [1, 55, 9, 56, 0.46, 18, 6, '良'],
      [2, 25, 11, 21, 0.65, 34, 9, '优'],
      [3, 56, 7, 63, 0.3, 14, 5, '良'],
      [4, 33, 7, 29, 0.33, 16, 6, '优'],
      [5, 42, 24, 44, 0.76, 40, 16, '优'],
      [6, 82, 58, 90, 1.77, 68, 33, '良'],
      [7, 74, 49, 77, 1.46, 48, 27, '良'],
      [8, 78, 55, 80, 1.29, 59, 29, '良'],
      [9, 267, 216, 280, 4.8, 108, 64, '重度污染'],
      [10, 185, 127, 216, 2.52, 61, 27, '中度污染'],
      [11, 39, 19, 38, 0.57, 31, 15, '优'],
      [12, 41, 11, 40, 0.43, 21, 7, '优'],
      [13, 64, 38, 74, 1.04, 46, 22, '良'],
      [14, 108, 79, 120, 1.7, 75, 41, '轻度污染'],
      [15, 108, 63, 116, 1.48, 44, 26, '轻度污染'],
      [16, 33, 6, 29, 0.34, 13, 5, '优'],
      [17, 94, 66, 110, 1.54, 62, 31, '良'],
      [18, 186, 142, 192, 3.88, 93, 79, '中度污染'],
      [19, 57, 31, 54, 0.96, 32, 14, '良'],
      [20, 22, 8, 17, 0.48, 23, 10, '优'],
      [21, 39, 15, 36, 0.61, 29, 13, '优'],
      [22, 94, 69, 114, 2.08, 73, 39, '良'],
      [23, 99, 73, 110, 2.43, 76, 48, '良'],
      [24, 31, 12, 30, 0.5, 32, 16, '优'],
      [25, 42, 27, 43, 1, 53, 22, '优'],
      [26, 154, 117, 157, 3.05, 92, 58, '中度污染'],
      [27, 234, 185, 230, 4.09, 123, 69, '重度污染'],
      [28, 160, 120, 186, 2.77, 91, 50, '中度污染'],
      [29, 134, 96, 165, 2.76, 83, 41, '轻度污染'],
      [30, 52, 24, 60, 1.03, 50, 21, '良'],
      [31, 46, 5, 49, 0.28, 10, 6, '优']
    ];
    var dataGZ = [
      [1, 26, 37, 27, 1.163, 27, 13, '优'],
      [2, 85, 62, 71, 1.195, 60, 8, '良'],
      [3, 78, 38, 74, 1.363, 37, 7, '良'],
      [4, 21, 21, 36, 0.634, 40, 9, '优'],
      [5, 41, 42, 46, 0.915, 81, 13, '优'],
      [6, 56, 52, 69, 1.067, 92, 16, '良'],
      [7, 64, 30, 28, 0.924, 51, 2, '良'],
      [8, 55, 48, 74, 1.236, 75, 26, '良'],
      [9, 76, 85, 113, 1.237, 114, 27, '良'],
      [10, 91, 81, 104, 1.041, 56, 40, '良'],
      [11, 84, 39, 60, 0.964, 25, 11, '良'],
      [12, 64, 51, 101, 0.862, 58, 23, '良'],
      [13, 70, 69, 120, 1.198, 65, 36, '良'],
      [14, 77, 105, 178, 2.549, 64, 16, '良'],
      [15, 109, 68, 87, 0.996, 74, 29, '轻度污染'],
      [16, 73, 68, 97, 0.905, 51, 34, '良'],
      [17, 54, 27, 47, 0.592, 53, 12, '良'],
      [18, 51, 61, 97, 0.811, 65, 19, '良'],
      [19, 91, 71, 121, 1.374, 43, 18, '良'],
      [20, 73, 102, 182, 2.787, 44, 19, '良'],
      [21, 73, 50, 76, 0.717, 31, 20, '良'],
      [22, 84, 94, 140, 2.238, 68, 18, '良'],
      [23, 93, 77, 104, 1.165, 53, 7, '良'],
      [24, 99, 130, 227, 3.97, 55, 15, '良'],
      [25, 146, 84, 139, 1.094, 40, 17, '轻度污染'],
      [26, 113, 108, 137, 1.481, 48, 15, '轻度污染'],
      [27, 81, 48, 62, 1.619, 26, 3, '良'],
      [28, 56, 48, 68, 1.336, 37, 9, '良'],
      [29, 82, 92, 174, 3.29, 0, 13, '良'],
      [30, 106, 116, 188, 3.628, 101, 16, '轻度污染'],
      [31, 118, 50, 0, 1.383, 76, 11, '轻度污染']
    ];
    var dataSH = [
      [1, 91, 45, 125, 0.82, 34, 23, '良'],
      [2, 65, 27, 78, 0.86, 45, 29, '良'],
      [3, 83, 60, 84, 1.09, 73, 27, '良'],
      [4, 109, 81, 121, 1.28, 68, 51, '轻度污染'],
      [5, 106, 77, 114, 1.07, 55, 51, '轻度污染'],
      [6, 109, 81, 121, 1.28, 68, 51, '轻度污染'],
      [7, 106, 77, 114, 1.07, 55, 51, '轻度污染'],
      [8, 89, 65, 78, 0.86, 51, 26, '良'],
      [9, 53, 33, 47, 0.64, 50, 17, '良'],
      [10, 80, 55, 80, 1.01, 75, 24, '良'],
      [11, 117, 81, 124, 1.03, 45, 24, '轻度污染'],
      [12, 99, 71, 142, 1.1, 62, 42, '良'],
      [13, 95, 69, 130, 1.28, 74, 50, '良'],
      [14, 116, 87, 131, 1.47, 84, 40, '轻度污染'],
      [15, 108, 80, 121, 1.3, 85, 37, '轻度污染'],
      [16, 134, 83, 167, 1.16, 57, 43, '轻度污染'],
      [17, 79, 43, 107, 1.05, 59, 37, '良'],
      [18, 71, 46, 89, 0.86, 64, 25, '良'],
      [19, 97, 71, 113, 1.17, 88, 31, '良'],
      [20, 84, 57, 91, 0.85, 55, 31, '良'],
      [21, 87, 63, 101, 0.9, 56, 41, '良'],
      [22, 104, 77, 119, 1.09, 73, 48, '轻度污染'],
      [23, 87, 62, 100, 1, 72, 28, '良'],
      [24, 168, 128, 172, 1.49, 97, 56, '中度污染'],
      [25, 65, 45, 51, 0.74, 39, 17, '良'],
      [26, 39, 24, 38, 0.61, 47, 17, '优'],
      [27, 39, 24, 39, 0.59, 50, 19, '优'],
      [28, 93, 68, 96, 1.05, 79, 29, '良'],
      [29, 188, 143, 197, 1.66, 99, 51, '中度污染'],
      [30, 174, 131, 174, 1.55, 108, 50, '中度污染'],
      [31, 187, 143, 201, 1.39, 89, 53, '中度污染']
    ];
    var schema = [
      { name: 'date', index: 0, text: '日期' },
      { name: 'AQIindex', index: 1, text: 'AQI' },
      { name: 'PM25', index: 2, text: 'PM2.5' },
      { name: 'PM10', index: 3, text: 'PM10' },
      { name: 'CO', index: 4, text: ' CO' },
      { name: 'NO2', index: 5, text: 'NO2' },
      { name: 'SO2', index: 6, text: 'SO2' },
      { name: '等级', index: 7, text: '等级' }
    ];
    var lineStyle = {
      normal: {
        width: 1,
        opacity: 0.5
      }
    };
    return {
      color: ['#c23531', '#91c7ae', '#dd8668'],
      legend: {
        top: 10,
        data: ['北京', '上海', '广州'],
        itemGap: 20
      },
      parallelAxis: [
        {
          dim: 0,
          name: schema[0].text,
          inverse: true,
          max: 31,
          nameLocation: 'start'
        },
        { dim: 1, name: schema[1].text },
        { dim: 2, name: schema[2].text },
        { dim: 3, name: schema[3].text },
        { dim: 4, name: schema[4].text },
        { dim: 5, name: schema[5].text },
        { dim: 6, name: schema[6].text },
        {
          dim: 7,
          name: schema[7].text,
          type: 'category',
          data: ['优', '良', '轻度污染', '中度污染', '重度污染', '严重污染']
        }
      ],
      parallel: {
        left: '5%',
        right: '13%',
        bottom: '10%',
        top: '20%',
        parallelAxisDefault: {
          type: 'value',
          name: 'AQI指数',
          nameLocation: 'end',
          nameGap: 20,
          nameTextStyle: {
            fontSize: 12
          }
        }
      },
      series: [
        {
          name: '北京',
          type: 'parallel',
          lineStyle: lineStyle,
          data: dataBJ
        },
        {
          name: '上海',
          type: 'parallel',
          lineStyle: lineStyle,
          data: dataSH
        },
        {
          name: '广州',
          type: 'parallel',
          lineStyle: lineStyle,
          data: dataGZ
        }
      ]
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
    if (node.data.name.indexOf('Clusters') > -1) {
      return name;
    } else {
      name.push(node.data.name);
      return this.getNamesNode(name, node.parent);
    }
  }

  hoverNode = (currentNode) => {
    let that = this;
    let treeAncestors = [];
    treeAncestors = this.getNamesNode(treeAncestors, currentNode);

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
        'name': 'Step 6'
      }
      let oldD = that.state.radarImgData;
      let dd = [];
      for (let key in oldD) {
        const da = oldD[key];
        if (da.type != 9) {
          dd.push(da);
        }
      }
      dd.push(obj);
      that.setState({
        radarImgData: dd
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
    if (a > min && a < max) {
      return true;
    } else {
      return false;
    }
  }

  onEvents = {
    'axisareaselected': this.onChartAxisareaSelected.bind(this),
  }

  onChartAxisareaSelected(param) {
    const intervals = param.intervals;
    const parallelAxisId = param.parallelAxisId.split('0')[0];
    const dd = this.state.step1Data;
    let tmp = [];
    let ids = [];
    for (let key in dd) {
      const d = dd[key];
      const flag = this.checkLineData(intervals[0], parallelAxisId.trim(), d);
      if (flag && !ids.includes(d['id'])) {
        tmp.push(d);
        ids.push(d['id']);
      }
    }
    this.setState({
      'highLight': tmp
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
  getclusterResults() {
    let getclusterResultsUrl = apiDomain + "getclusterResults"
    let dataToBeSent = { k: 3 };

    $.ajax({
      type: "POST",
      url: getclusterResultsUrl,
      data: JSON.stringify(dataToBeSent),
      dataType: 'json',
      success: function (result) {
        self.setState({
          'bubbleDiagramOption': {
            data: result.sizes,
            groups: result.groupIDs,
            width: 300,
            height: 300
          }
        });
      }
    });
  }

  onSelectedRuleListItems(ids) {
    // Update circle node
    const circleNodes = document.querySelectorAll("#circlesArea circle");
    for (let i = 0; i < circleNodes.length; i++) {
      circleNodes[i].setAttribute('fill', 'rgba(100, 100, 100, 0.5)');
    }

    // send to learn rule
    let learnRulesUrl = apiDomain + "learnRules"
    let dataToBeSent = { selectedIds: ids };

    $.ajax({
      type: "POST",
      url: learnRulesUrl,
      data: JSON.stringify(dataToBeSent),
      dataType: 'json',
      success: function (result) {
        self.setState({
          'ruleStdResultData': result.ml_result_std
        });
      }
    });
  }

  onUpdatedRuleValue(self, rule, ruleItemsData) {
    let matchedData = ruleItemsData;
    for (let key in rule) {
      if (key == 'label') {
        continue;
      }
      matchedData = matchedData.filter(item =>
        (rule[key][2] === '(' ? item[key] > rule[key][0] : item[key] >= rule[key][0]) &&
        (rule[key][3] === ')' ? item[key] < rule[key][1] : item[key] <= rule[key][1]))
    }

    // handle update circles
    // console.log(self.state.bubbleDiagramOption.groups);
    const groups = self.state.bubbleDiagramOption.groups;
    // let numberOfMatchedInGroups = new Array(groups.length).fill(0);

    var updatedTreeData = self.state.treeDiagramData;

    for (let i = 0; i < groups.length; i++) {
      // const matchedGroupItems = groups[i].filter(gid => matchedData.some(item => item['id'] == gid));
      const matchedGroupItems = matchedData.filter(item => groups[i].some(gid => item['id'] == gid));

      // numberOfMatchedInGroups[i] = matchedGroupItems.length;
      const coverage = matchedGroupItems.length / groups[i].length;

      //purple 
      // const r = 100 + (85 - 100) * coverage;
      // const g = 100 + (26 - 100) * coverage;
      // const b = 100 + (139 - 100) * coverage;

      //Orange
      const r = 100 + (255 - 100) * coverage;
      const g = 100 + (165 - 100) * coverage;
      const b = 100 + (0 - 100) * coverage;

      const circleNode = document.querySelector("#circlesArea circle[groupId='" + i + "']");
      circleNode.setAttribute('fill', 'rgba(' + r + ', ' + g + ', ' + b + ', 0.5)');

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
        console.log(tags);
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

  render() {
    let stepButtons = [];
    this.state.step1tasks.forEach((el) => {
      console.log(el.name);
      if (el.name == 'Normalization l2' || el.name == 'MDS-5') {
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
            <span>And</span>
          </div>
        );
      } else {
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
          </div>);
      }
    });

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
      let title = 'cluster ' + (index + 1)
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
          width: 900,
          height: 900
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
      width: 300,
      height: 200
    };
    return (
      <div id="main">
        <div id="main-container">
          <div className="top">
            <h2>PRE-VIS</h2>
            <span>Audit Algorithmic Bias Caused By Pre-processing</span>
          </div>
          <div className="other">
            <div className="other-left">
              <div className="step1">
                <div className="title">
                  <div className="text">1.Select must-have Operations<QuestionCircleOutlined /></div>
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
                  <Button type="primary" size='small' onClick={() => this.clickStep3()}>Highlight qualified Strategies</Button>
                </div>
              </div>

              <div className="step2">
                <div className="title">
                  <div className="text">2.Set Clusters Number <QuestionCircleOutlined /></div>
                </div>
                <div className="content scroll" style={{ 'height': this.state.step2Height }}>
                  <div className="content-l">
                    <Select defaultValue="3" style={{ width: 120 }} onChange={(val) => this.handleChange(val)}>
                      <Option value="3">3</Option>
                      <Option value="4">4</Option>
                      <Option value="5">5</Option>
                      <Option value="6">6</Option>
                    </Select>
                    <Button type="primary" onClick={() => this.clickStep2()}>Generate Clusters</Button>
                  </div>
                  <div className="content-r">
                    {/* <BubbleDiagram {...bubbleDiagramOption} /> */}
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
                  <div className="text">4.Clusters View<QuestionCircleOutlined /></div>

                </div>
                <div className="content">
                  <div className="content">
                    <BubbleDiagram onSelectHandle={this.onSelectedRuleListItems} {...this.state.bubbleDiagramOption} />
                  </div>
                  <div className='content scroll' style={{ 'height': this.state.step3Height }}>
                    <div className='content-left'></div>
                    <div className='content-right'>
                      <ReactEcharts
                        option={this.getBarOption()}
                        notMerge={true}
                        lazyUpdate={true}
                        style={{ width: '100%', height: '100%' }}
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="step5">
                <div className="title">
                  <div className="text">5.Rules generated from selected cluster<QuestionCircleOutlined /></div>
                </div>
                <div className="content">
                  <RuleListComponment onUpdatedRuleValue={this.onUpdatedRuleValue} {...{ ruleItemsData: ruleItemsData, mlStdResult: this.state.ruleStdResultData, parentComponment: this }} />
                </div>
              </div>
            </div>
            <div className="other-right">
              <div className="step6">
                <div className="title">
                  <div className="text">6.Tree View of Strategies Clusters<QuestionCircleOutlined /></div>
                </div>
                <div className="content">
                  <div className='scroll' style={{ "height": this.state.contentRightHeight1 }}>
                    {treeOptions}
                  </div>

                </div>
              </div>
              <div className="step7">
                <div className="title">
                  <div className="text">7.Strategies Custimization and Comparasion<QuestionCircleOutlined /></div>
                </div>
                <div className="content">
                  <div className='scroll' style={{ "height": this.state.contentRightHeight2 }}>
                    <div className="wip" onDragOver={(e) => this.onDragOver(e)}>
                      {step7Btns}
                    </div>
                    <div className="droppable" onDragOver={(e) => this.onDragOver(e)} >
                      <TreeMap getRoadMap={this.getRoadMap} {...this.treeInfo} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
