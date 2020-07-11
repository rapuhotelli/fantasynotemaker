import * as PIXI from 'pixi.js'

const filters = {
    alphaNumericWithPeriod: (text) => text.replace(/[^a-zA-Z.\n ]/mg, '')
}

declare global {
    interface Window {
        WebFontConfig: {
            google: {
                families: string[]
            },
            active: () => void
        }
    }
}

window.WebFontConfig = {
    google: {
        families: ['Zeyada', 'La Belle Aurore'],
    },

    active() {
        init();
    },
};

(function() {
    const wf = document.createElement('script');
    wf.src = `${document.location.protocol === 'https:' ? 'https' : 'http'
    }://ajax.googleapis.com/ajax/libs/webfont/1/webfont.js`;
    wf.type = 'text/javascript';
    wf.async = true;
    const s = document.getElementsByTagName('script')[0];
    s.parentNode.insertBefore(wf, s);
}());

const WIDTH = 510*2

const styles = [
    {
        label: 'La Belle Aurore (fine handwritten)',
        style: {
            fontWeight: 'normal',
            fontFamily: 'La Belle Aurore',
            fontSize: 32
        }
    },
    {
        label: 'Zeyada (casual handwritten)',
        style: {
            fontFamily: 'Zeyada',
            fontSize: 48
        }
    },
    {
        label: 'Rellanic (elven script)',
        filter: filters.alphaNumericWithPeriod,
        lineHeightOffset: 10,
        style: {
            fontFamily: 'Rellanic',
            fontSize: 36,
        }
    },
    {
        label: 'Davek (dwarven, primordial, etc...)',
        filter: filters.alphaNumericWithPeriod,
        lineHeightOffset: 20,
        style: {
            fontFamily: 'Davek',
            fontSize: 36,
            lineHeight: 36
        }
    }
]

const scriptSelector = document.getElementById('script-type') as HTMLSelectElement
styles.forEach(styleObj => {
    const option = document.createElement('option')
    option.innerText = styleObj.label
    option.setAttribute('value', styleObj.style.fontFamily)
    scriptSelector.appendChild(option)
})

const init = () => {
    let currentText = null;
    let currentPixiText = null
    let currentPixiTextStyle = null;
    let showFooter = true;

    const baseTextStyle = {
        wordWrap: true,
        wordWrapWidth: WIDTH - 100,
        fontSize: 28
    }

    const resetPixiFont = (e?) => {
        console.log('resetPixiFont')

        if (currentPixiText) {
            currentPixiText.destroy()
            currentPixiText = null
            currentPixiTextStyle = null
        }

        const selectedFontStyle = {
            ...baseTextStyle,
            ...styles[scriptSelector.selectedIndex].style
        }

        currentPixiTextStyle = new PIXI.TextStyle(selectedFontStyle)
        currentPixiText = new PIXI.Text(currentText, currentPixiTextStyle)
        currentPixiText.x = 50
        currentPixiText.y = 50
        container.addChild(currentPixiText)
        setPixiText(currentText)
    }

    let app = new PIXI.Application({
        backgroundColor: 0xFFFFFF,
        width: WIDTH,
        height: 660*2,
    })

    document.getElementById('container').appendChild(app.view)




    const saveButton = document.createElement('button')
    saveButton.innerText = 'Save!'
    saveButton.addEventListener('click', () => {
        app.renderer.extract.canvas(app.stage).toBlob((b) => {
            const a = document.createElement('a');
            document.body.append(a);
            a.download = 'screenshot';
            a.href = URL.createObjectURL(b);
            a.click();
            a.remove();
        }, 'image/png');
    })
    document.getElementById('container').appendChild(saveButton)

    const footerCb = document.getElementById('footer-cb')
    footerCb.addEventListener('change', ({ target }) => {
        showFooter = (<HTMLInputElement>target).checked
        setPixiText(currentText)
    })

    const colorCb = document.getElementById('color-cb')
    colorCb.addEventListener('change', ({ target }) => {
        bg.tint = (<HTMLInputElement>target).checked ? 0xffe9d3 : 0xFFFFFF
    })

    const container = new PIXI.Container()
    app.stage.addChild(container)
    const sprites = {} as any
    const loader = PIXI.Loader.shared
    const textArea = document.getElementById('text-content') as HTMLInputElement
    textArea.style.height = `${textArea.scrollHeight}px`

    const bg = PIXI.Sprite.from('background-with-line.jpg')
    bg.height = 3263
    bg.x =  -150 // -1400
    bg.tint = 0xffe9d3
    container.addChild(bg)

    const thing = new PIXI.Graphics();
    app.stage.addChild(thing);
    thing.x = 0;
    thing.y = 0

    const updateRenderMask = () => {
        thing.clear()
        thing.beginFill(0xcacaca)
        thing.moveTo(0, 0)
        thing.lineTo(app.renderer.width, 0)
        thing.lineTo(app.renderer.width, app.renderer.height)
        thing.lineTo(0, app.renderer.height)
    }
    updateRenderMask()
    container.mask = thing

    thing.lineStyle(0);

    const onTextChange = (e) => {
        setPixiText(e.target.value)
    }

    const setPixiText = (text) => {
        textArea.style.height = 'auto';
        textArea.style.height = `${textArea.scrollHeight}px`

        currentText = text
        currentPixiText.text = styles[scriptSelector.selectedIndex].filter
            ? styles[scriptSelector.selectedIndex].filter(text)
            : text

        const lineHeightOffset =  styles[scriptSelector.selectedIndex].lineHeightOffset || 0
        console.log(lineHeightOffset)
        const newHeight = Math.min(currentPixiText.height + 50 + lineHeightOffset, 2000)
        app.renderer.resize(WIDTH, newHeight)

        const bgOffset = bg.height - newHeight
        bg.y = -bgOffset + (showFooter ? 0 : 200) // 200 magic offset

        updateRenderMask()
    }

    currentText = textArea.value
    resetPixiFont()

    document.getElementById('text-content').addEventListener('input', onTextChange)
    document.getElementById('script-type').addEventListener('change', resetPixiFont)
}
// */
