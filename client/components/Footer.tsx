import React, { CSSProperties } from "react"
import styled from "styled-components"

const FooterDiv = styled.div`
    padding: 0px;
    display: block;
    width: 100%;
    height: 40px;
    color: white;
    bottom: 0;
    text-align: center;
    position: fixed;
`

export class Footer extends React.Component<{ style?: CSSProperties }> {
    public render() {
        return (
            <FooterDiv>
                Central Logger 0.1.0
            </FooterDiv>
        )
    }
}