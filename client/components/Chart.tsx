import React from "react"
import { Segment, Table, Icon, Header, Dropdown, Loader, Button } from "semantic-ui-react"
import { Logs } from "./Log"
import DatePicker from "react-datepicker"
import moment, { Moment } from "moment"
import "react-datepicker/dist/react-datepicker.css";
import { Log } from "../share/LoggerApi"
import "/css/Body.css"
import ReactEcharts from "echarts-for-react";
import { LoggerApi } from "../share/LoggerApi"
import { getApiUrl } from "../share/Configuration"

type Props = {
    Day: Moment
    onDayChange: (Moment) => void
    info: number[]
    error: number[]
    debug: number[]
    trace: number[]
    warning: number[]
    critical: number[]
}
type State = {
    startDate: Moment
    loading: boolean
}

export class Chart extends React.Component<Props, State> {
    constructor(props) {
        super(props)
        this.state = {
            startDate: moment(),
            loading: true
        };
    }
    public setDay = (data) => {
        this.props.onDayChange(data)
        this.setState({ startDate: data })
    }
    public render() {
        const option = {
            title: {
                text: "Log Chart",
                subtext: "ประจำวันที่ " + this.state.startDate.format("LL").toString()
            },
            tooltip: {
                trigger: "axis"
            },
            legend: {
                data: ["Error", "Info", "Debug", "Trace", "Warning", "Critical"]
            },
            grid: {
                left: "3%",
                right: "4%",
                bottom: "3%",
                containLabel: true
            },
            toolbox: {
                feature: {
                    saveAsImage: {
                        title: "บันทึก"
                    },
                }
            },
            xAxis: {
                type: "category",
                boundaryGap: false,
                data: ["00:00", "01:00", "02:00", "03:00", "04:00", "05:00", "06:00", "07:00", "08:00"
                    , "09:00", "10:00", "11:00", "12:00", "13:00", "14.00", "15.00", "16.00", "17.00"
                    , "18.00", "19.00", "20:00", "21:00", "22.00", "23.00"]
            },
            yAxis: {
                type: "value"
            },
            series: [
                {
                    name: "Error",
                    type: "line",
                    data: this.props.error
                },
                {
                    name: "Info",
                    type: "line",
                    data: this.props.info
                },
                {
                    name: "Debug",
                    type: "line",
                    data: this.props.debug
                },
                {
                    name: "Trace",
                    type: "line",
                    data: this.props.trace
                },
                {
                    name: "Warning",
                    type: "line",
                    data: this.props.warning
                },
                {
                    name: "Critical",
                    type: "line",
                    data: this.props.critical
                }
            ]
        };
        let style = {
            marginLeft: "10px",
            marginRight: "10px"
        }
        return (
            <Segment.Group>
                <Segment textAlign="center" inverted color="yellow">
                    <Header as="h2" floated="left">
                        Log Chart
                    </Header>
                    <Icon style={style} size="large" name="calendar alternate outline" />
                    <div className="ui input datepicker">
                        <DatePicker
                            dateFormat="DD/MM/YY"
                            selected={this.props.Day}
                            onChange={this.setDay}
                            isClearable={false}
                            placeholderText="Select Date"
                            className="inputdate" />
                    </div>
                </Segment>
                <Segment textAlign="right" style={{ minHeight: "calc( 100vh - 230px )" }}>
                    <div className="loglist" style={{ width: "100%" }}>
                        <ReactEcharts
                            option={option}
                            notMerge={true}
                            lazyUpdate={true}
                            theme={"theme_name"}
                        />
                    </div>
                </Segment>
            </Segment.Group>
        )
    }
}