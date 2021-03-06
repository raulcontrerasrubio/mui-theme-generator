import React from 'react'
import PureRenderMixin from 'react-addons-pure-render-mixin';
import Slider from 'material-ui/Slider';
import IconButton from 'material-ui/IconButton';

import { ColorInfo, ColorHelper } from '../../utils/ColorHelper'


const multiplier = 1.5;

const styles = {
    container: {
        main: {
            position: 'relative',
            zIndex: 2,
            display: 'flex',
            flexDirection: 'column',
            padding: '5px 14px 14px',
            marginLeft: 32,
            backgroundColor: 'rgba(125, 125, 125, 0.12)'
        },
        color: {
            display: 'flex',
            alignItems: 'flex-end'
        },
        tone: {
            display: 'flex'
        },
        alpha: {
            display: 'flex',
            flexDirection: 'row'
        },
        alphaText: {
            flex: 10,
            textAlign: 'right',
            margin: 'auto'
        },
        alphaValue: {
            flex: 90
        },
        alphaSlider: {
            // margin: 0,
            marginTop: 10,
            marginBottom: 0
        }
    },
    button: {
        color: {
            width: 15,
            height: 15,
            padding: 0,
            flexGrow: 1
        },
        tone: {
            color: '#c3c3c3',
            width: 15,
            height: 20,
            padding: 0,
            flexGrow: 1
        }
    }
};


export default class ColorPicker extends React.Component {

    constructor(props) {
        super(props);
        this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);

        let colorInfo = new ColorInfo(props.color);
        let alpha = colorInfo.rgba.a;

        this.state = {
            colorInfo,
            alpha
        }
    }

    changeColor = (color) => {
        let { colorInfo } = this.state;
        let previousColor = colorInfo.colorTone && colorInfo.colorTone.color;

        try {
            colorInfo.parse(color + (colorInfo.colorTone && colorInfo.colorTone.tone));
        }
        catch (e) {
            colorInfo.parse(color + Object.keys(ColorHelper.colorToneList[color])[5]);
        }

        this.propagateColorChange(previousColor);
    }

    changeTone = (color, tone) => {
        let { colorInfo } = this.state;
        let previousColor = colorInfo.colorTone && colorInfo.colorTone.color;

        colorInfo.parse(color + tone);

        this.propagateColorChange(previousColor);
    }

    changeAlpha = (alpha) => {
        let { colorInfo } = this.state;
        colorInfo.setAlpha(alpha);
        this.setState({ alpha });
    }

    propagateColorChange = (previousColor) => {
        let { colorInfo, alpha } = this.state;
        let currentColor = colorInfo.colorTone && colorInfo.colorTone.color;
        if (previousColor != undefined) {
            if (currentColor == "")
                alpha = colorInfo.getAlpha();
            else if (previousColor == "")
                alpha = 1;
        }

        this.changeAlpha(alpha);
        this.setState({ colorInfo });
        this.props.onColorChange(colorInfo.get());
    }

    generateColorSelector = () => {
        let { colorInfo } = this.state;
        let selectedColor = colorInfo.colorTone && colorInfo.colorTone.color;

        return (
            <div style={{ ...styles.container.color, height: styles.button.color.height * multiplier }} >
                {
                    Object.keys(ColorHelper.colorToneList).map(color =>
                        <IconButton
                            key={color}
                            style={{
                                ...styles.button.color,
                                backgroundColor: ColorHelper.getDefaultColor(color),
                                height: (color === selectedColor ? multiplier : 1) * styles.button.color.height
                            }}
                            onClick={() => this.changeColor(color)}
                            tooltip={color}
                            tooltipPosition="top-center"
                        />
                    )
                }
            </div>
        );
    }

    generateToneSelector = () => {
        let { colorInfo } = this.state;
        let colorState = colorInfo.colorTone && colorInfo.colorTone.color;
        let toneState = colorInfo.colorTone && colorInfo.colorTone.tone;

        return (
            <div style={{ ...styles.container.tone, height: styles.button.tone.height * multiplier }}>
                {
                    Object.keys(ColorHelper.colorToneList[colorState]).map(tone =>
                        <IconButton
                            key={tone}
                            style={{
                                ...styles.button.tone,
                                backgroundColor: ColorHelper.colorToneList[colorState][tone].get(),
                                height: (tone === toneState ? multiplier : 1) * styles.button.tone.height
                            }}
                            onClick={() => this.changeTone(colorState, tone)}
                            tooltip={tone}
                            tooltipPosition="middle-center"
                        />
                    )
                }
            </div>
        );
    }

    generateAlphaSelector = (alpha) => (
        <Slider
            min={0}
            max={1}
            step={0.01}
            value={alpha}
            onChange={(e, alpha) => this.setState({ alpha })}
            onDragStop={e => this.propagateColorChange()}
            style={styles.container.alphaValue}
            sliderStyle={styles.container.alphaSlider}
        />
    );

    render() {
        let tone = ((this.state.colorInfo || {}).colorTone || {}).tone;
        let { alpha } = this.state;

        return (
            <div style={styles.container.main}>
                {this.generateColorSelector()}
                {tone ? this.generateToneSelector() : null}
                {tone ?
                    <div style={styles.container.alpha}>
                        {this.generateAlphaSelector(alpha)}
                        <div style={styles.container.alphaText}>{alpha}</div>
                    </div> : null
                }
            </div>
        );
    }
}