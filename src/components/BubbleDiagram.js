import React from 'react';
import * as d3 from 'd3';
import Checkbox from 'antd/lib/checkbox/Checkbox';
import { PrinterOutlined } from '@ant-design/icons';
import $ from "jquery";

class BubbleDiagram extends React.Component {
    constructor(props) {
        super(props);

        this.onClick = this.onClick.bind(this);
        this.state = {
            circles: []
        };
    }

    onClick = (event) => {
        const { groups, onSelectHandle } = this.props;
        const groupId = parseInt(event.currentTarget.getAttribute('groupId'))
        onSelectHandle(groups[groupId], groupId)

        const allNodes = event.currentTarget.parentElement.childNodes
        for (let i = 0; i < allNodes.length; i++) {
            allNodes[i].style = null;
        }
        event.currentTarget.style.stroke = "rgb(85, 26, 139)";
        event.currentTarget.style.strokeWidth = "2";
        event.currentTarget.style.strokeDasharray = "5";
    }

    getColor = (index, size) => {
        // const COLORS = ['rgba(78, 160, 73, 0.5)', 'rgba(200, 46, 51, 0.5)', 'rgba(167, 40, 70, 0.5)', 'rgba(35, 105, 157, 0.5)', 'rgba(244, 157, 63, 0.5)', 'rgba(21, 71, 108, 0.5)'];
        // const i = Math.ceil(Math.random() * size);
        // return COLORS[i];
        return 'rgba(100, 100, 100, 0.5)'
    }

    getScale = (width, data) => {
        let sum = 0;
        for (let key in data) {
            sum += data[key];
        }
        return width / sum;
    }

    getCX = (index, width, sacle) => {
        if (index == 0) {
            return width / 2;
        } else {
            return 10;
        }
    }

    getCY = (index, height, sacle) => {
        if (index == 0) {
            return height / 2;
        } else {
            return 10;
        }
    }

    //盘点Y坐标是否在范围内
    checkY = (y, index) => {
        const { width, height, data } = this.props;
        const scale = this.getScale(height, data);
        const r = data[index] * scale / 2;
        if ((y - r) >= 0 && (y + r) <= height) {
            return true;
        } else {
            return false;
        }
    }

    //判断X坐标是否在范围内
    checkX = (x, index) => {
        const { width, height, data } = this.props;
        const scale = this.getScale(width, data);
        const r = data[index] * scale / 2;

        if ((x - r) >= 0 && (x + r) <= width) {
            return true;
        } else {
            return false;
        }
    }

    checkR = (x1, y1, index, arr) => {
        const { width, height, data } = this.props;
        const scale = this.getScale(width, data);

        if (arr.length == 0) {
            return true;
        }
        let rst = false;
        for (let key in arr) {
            let val = arr[key];
            let x2 = val[0];
            let y2 = val[1];
            let r = val[2] * scale / 2;
            let rindex = data[index] * scale / 2;
            let w = Math.abs(x1 - x2);
            let h = Math.abs(y1 - y2);

            if (Math.sqrt(w * w + h + h) >= (r + rindex)) {
                rst = true;
            } else {
                rst = false;
            }
        }
        return rst;
    }

    createCircles = () => {
        const { width, height, data } = this.props;
        let index = 0;
        const size = data.length;
        let rst = [];
        let avoidArea = [];
        const scale = this.getScale(width, data);

        while (index < size) {
            //first get random X,Y
            let x = Math.random() * width;
            let y = Math.random() * height;

            let shouldSkip = false
            if (this.checkX(x, index) && this.checkY(y, index)) {//已经在坐标范围内了
                for (let i = 0; i < avoidArea.length; i++) {
                    if (!((x < avoidArea[i][0] || x > avoidArea[i][2]) && (y < avoidArea[i][1] || y > avoidArea[i][3]))) {
                        shouldSkip = true
                        break
                    }
                }
            } else {
                shouldSkip = true
            }
            if (shouldSkip) {
                continue;
            }
            const r = data[index] * scale / 2;
            avoidArea.push([x - r, y - r, x + r, y + r]);
            const fill = this.getColor(index, size);

            console.log(x, y, r,);
            rst.push(
                <text x={x} y={y} text-anchor="middle" stroke="#000" stroke-width="0px" dy=".1em">{index + 1}</text>
            )
            rst.push(
                <circle cx={x} cy={y} r={r} fill={fill} onClick={this.onClick} groupId={index} />
            );
            index++;
        }
        this.setState({ circles: rst });
    }

    componentDidMount() {
    }
    componentDidUpdate(prevProps, prevState) {
        if (this.props.data === prevProps.data) {
            return
        }
        this.createCircles()
    }
    render() {
        const { width, height, data } = this.props;
        return (
            <svg id='circlesArea' width={width} height={height}>{this.state.circles}</svg>
        );
    }
}

export default BubbleDiagram;