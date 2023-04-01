import React from 'react';
import $, { type } from "jquery";
import Popup from 'reactjs-popup';
import './PopupScatterSelection.css'
import { QuestionCircleOutlined} from '@ant-design/icons';
import ReactTooltip from 'react-tooltip';

class PopupScatterSelection extends React.Component {
    constructor(props) {
        super(props);
    }

    getLevel(type,index){
        const { clusterRate } = this.props;
        if(Object.keys(clusterRate).length === 0){
            return 0;
        }
        let arr = [];
        const kmeans = clusterRate['kmeans'][index];
        arr.push(kmeans);
        const hac = clusterRate['hac'][index];
        arr.push(hac);
        const dbscan = clusterRate['dbscan'][index];
        arr.push(dbscan);
        const optics = clusterRate['optics'][index];
        arr.push(optics);
        const birch = clusterRate['birch'][index];
        arr.push(birch);
        let max = arr[0];
        for(let i=0;i<arr.length;i++){
            if(arr[i]>max){
                max = arr[i];
            }
        }

        console.log(index, type);
        if(index==2 && type=='kmeans'){
            return max.toFixed(2);
        }
        if(index==3 && type=='optics'){
            return max.toFixed(2);
        }
        if(index==4 && type=='hac'){
            return max.toFixed(2);
        }
        if(index==5 && type=='birch'){
            return max.toFixed(2);
        }
        if(index==6 && type=='dbscan'){
            return max.toFixed(2);
        }
        return '';
    }

    render() {
        const { mainAppDelegate, clusterRate } = this.props;
        const typeRef = React.createRef();

        const numbers = Object.keys(clusterRate).flatMap(k => Object.keys(clusterRate[k]).map(l => clusterRate[k][l]))
        const maxNum = Math.max(...numbers), minNum = Math.min(...numbers)
        const normalNumbers = numbers.map(x => (x - minNum) / (maxNum - minNum))
        let normalNumberMap = {}
        for (let i = 0; i < numbers.length; i++) {
            normalNumberMap[numbers[i]] = normalNumbers[i];
        }
        const ITEMS = ['','','kmeans','hac','dbscan','optics','birch'];
        let tbody = [];
        let tline1 = [];
        for(let i = 2;i<=6;i++){
            let level2 = this.getLevel(ITEMS[i],2);
            let level3 = this.getLevel(ITEMS[i],3);
            let level4 = this.getLevel(ITEMS[i],4);
            let level5 = this.getLevel(ITEMS[i],5);
            let level6 = this.getLevel(ITEMS[i],6);
            tline1.push(
                <tr>
                    <td>{ITEMS[i]}</td>
                    <td><button onClick={()=>{
                        if(level2!=''){
                            mainAppDelegate.projectScatter(typeRef.current.value);
                            mainAppDelegate.getclusterResults(2, "kmeans");
                        }
                    }} style={{backgroundColor:'rgb(0,0,'+level2*255+')'}} className='close'>{level2}</button></td>
                    <td><button onClick={()=>{
                        if(level3!=''){
                            mainAppDelegate.projectScatter(typeRef.current.value);
                            mainAppDelegate.getclusterResults(3, "kmeans");
                        }
                    }} style={{backgroundColor:'rgb(0,0,'+level3*255+')'}} className='close'>{level3}</button></td>
                    <td><button onClick={()=>{
                        if(level4!=''){
                            mainAppDelegate.projectScatter(typeRef.current.value);
                            mainAppDelegate.getclusterResults(4, "kmeans");
                        }
                    }} style={{backgroundColor:'rgb(0,0,'+level4*255+')'}} className='close'>{level4}</button></td>
                    <td><button onClick={()=>{
                        if(level5!=''){
                            mainAppDelegate.projectScatter(typeRef.current.value);
                            mainAppDelegate.getclusterResults(5, "kmeans");
                        }
                    }} style={{backgroundColor:'rgb(0,0,'+level5*255+')'}} className='close'>{level5}</button></td>
                    <td><button onClick={()=>{
                        if(level6!=''){
                            mainAppDelegate.projectScatter(typeRef.current.value);
                            mainAppDelegate.getclusterResults(6, "kmeans");
                        }
                    }} style={{backgroundColor:'rgb(0,0,'+level6*255+')'}} className='close'>{level6}</button></td>
                </tr>

            );
        }

        tbody.push(tline1);
        return (
            <div>
                <select name="projectionTypes" id="projectionTypes" ref={typeRef} onChange={(event)=>{
                    mainAppDelegate.projectScatter(event.target.value);
                }}>
                    <option value="pca">PCA</option>
                    <option value="mds">MDS</option>
                    <option value="tsne">TSNE</option>
                </select>
                <Popup
                    trigger={<button className="button"> Select Clusters </button>}
                    modal
                    nested
                >
                    {close => (
                        <div className="modal">
                            <button className="close" onClick={close}>
                                &times;
                            </button>
                            <div className="header"> Cluster Selection <QuestionCircleOutlined data-tip='信息填写在这里' /> </div>
                            <ReactTooltip />
                            <div className="content">
                                <table>
                                    <tr>
                                        <td>  </td>
                                        <td> 2 </td>
                                        <td> 3 </td>
                                        <td> 4 </td>
                                        <td> 5 </td>
                                        <td> 6 </td>
                                    </tr>
                                    {tbody}
                                </table>
                            </div>
                        </div>
                    )
                    }
                </Popup>
            </div >
        );
    }
}

export default PopupScatterSelection;