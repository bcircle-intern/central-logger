import React from "react"
import { Segment, Image, Icon, Header, Dropdown, Loader, Button } from "semantic-ui-react"
import { Moment } from "moment"
import { Log } from "../share/LoggerApi"
import "/css/Body.css"

type Props = {
}
type State = {
}

export class Line extends React.Component<Props, State> {
    private limit: number;
    private log: Log[]
    constructor(props) {
        super(props)
        this.state = {
        }
    }
    public render() {
        let style = {
            marginLeft: "10px",
            marginRight: "10px"
        }

        return (
            <Segment.Group>
                <Segment textAlign="center" inverted color="green" size="mini">
                    <Icon style={style} size="mini" />
                    <Header as="h3" floated="left">
                        Line Account
                    </Header>
                </Segment>
                <Segment textAlign="center" style={{ minHeight: "calc( 100vh - 230px )" }}>
                    <Image src="https://www.picz.in.th/images/2018/09/25/fFO29I.png" size="medium" verticalAlign="top" />
                </Segment>
            </Segment.Group>
        )
    }
}