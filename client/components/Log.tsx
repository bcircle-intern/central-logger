import React from "react"
import { Log, LogLevel } from "../share/LoggerApi";
import { Table, Icon, SemanticCOLORS, Popup } from "semantic-ui-react"
import { Divider, Segment } from 'semantic-ui-react'
import moment from "moment"
import "moment/locale/th"
import "/css/Body.css"
import styled from "styled-components";

type LogProps = {
    logsNow: Log
}
type State = {
    alert: boolean
}

export class Logs extends React.Component<LogProps, State> {
    constructor(props) {
        super(props)
        this.state = {
            alert: null
        }
    }

    public render() {
        let color: SemanticCOLORS = "red"
        switch (this.props.logsNow.logLevel) {
            case 1:
                color = "blue"
                break
            case 2:
                color = "grey"
                break
            case 3:
                color = "yellow"
                break
            case 4:
                color = "red"
                break
            case 5:
                color = "orange"
                break
        }
        return (

            <div>
                <Table.Cell style={{ width: "16vw", textAlign: "right" }}>{moment(this.props.logsNow.dateTime).format("L, h:mm:ss")}</Table.Cell>
                <Table.Cell style={{ width: "13vw", textAlign: "right" }}>{this.props.logsNow.category}</Table.Cell>
                <Table.Cell textAlign="right"><Popup trigger={<Icon name="dot circle" color={color} />} content={LogLevel[this.props.logsNow.logLevel]} /></Table.Cell>
                <Table.Cell >{this.props.logsNow.message}</Table.Cell>
                <Divider />
            </div>

        )
    }
}