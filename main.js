window.onload = async function () {
    // Create a PixiJS application.
    const app = new PIXI.Application();

    // Initialize the application
    await app.init({ background: '#1099bb', resizeTo: window });

    // Append the application canvas to the document body
    document.body.appendChild(app.canvas);

    //callLoader to load all assets
    await LoadAssets(app);

    //init symbol width and height
    const SYMBOL_WIDTH = app.screen.width / 5;
    const SYMBOL_HEIGHT = app.screen.height / 5;

    // Create slot symbols
    const slotTextures = [
        PIXI.Texture.from('assets/hv1_symbol.png'),
        PIXI.Texture.from('assets/hv2_symbol.png'),
        PIXI.Texture.from('assets/hv3_symbol.png'),
        PIXI.Texture.from('assets/hv4_symbol.png'),
        PIXI.Texture.from('assets/lv1_symbol.png'),
        PIXI.Texture.from('assets/lv2_symbol.png'),
        PIXI.Texture.from('assets/lv3_symbol.png'),
        PIXI.Texture.from('assets/lv4_symbol.png')
    ];

    let reel_indexes = [0, 0, 0, 0, 0];
    let resulting_reels = [[], [], []];

    /*
    
    Initialize bands
    
    band1 = ["hv2", "lv3", "lv3", "hv1", "hv1", "lv1", "hv1", "hv4", "lv1", "hv3", "hv2", "hv3", "lv4", "hv4", "lv1", "hv2", "lv4", "lv1", "lv3", "hv2"]
    band2 = ["hv1", "lv2", "lv3", "lv2", "lv1", "lv1", "lv4", "lv1", "lv1", "hv4", "lv3", "hv2", "lv1", "lv3", "hv1", "lv1", "lv2", "lv4", "lv3", "lv2"]
    band3 = ["lv1", "hv2", "lv3", "lv4", "hv3", "hv2", "lv2", "hv2", "hv2", "lv1", "hv3", "lv1", "hv1", "lv2", "hv3", "hv2", "hv4", "hv1", "lv2", "lv4"]
    band4 = ["hv2", "lv2", "hv3", "lv2", "lv4", "lv4", "hv3", "lv2", "lv4", "hv1", "lv1", "hv1", "lv2", "hv3", "lv2", "lv3", "hv2", "lv1", "hv3", "lv2"]
    band5 = ["lv3", "lv4", "hv2", "hv3", "hv4", "hv1", "hv3", "hv2", "hv2", "hv4", "hv4", "hv2", "lv2", "hv4", "hv1", "lv2", "hv1", "lv2", "hv4", "lv4"]  
    
    */
    //Converting strings into 0 based indexes for easier handling
    const bands = [
        [1, 6, 6, 0, 0, 4, 0, 3, 4, 2, 1, 2, 7, 3, 4, 1, 7, 4, 6, 1],
        [0, 5, 6, 5, 4, 4, 7, 4, 4, 3, 6, 1, 4, 6, 0, 4, 5, 7, 6, 5],
        [4, 1, 6, 7, 2, 1, 5, 1, 1, 4, 2, 4, 0, 5, 2, 1, 3, 0, 5, 7],
        [1, 5, 2, 5, 7, 7, 2, 5, 7, 0, 4, 0, 5, 2, 5, 6, 1, 4, 2, 5],
        [6, 7, 1, 2, 3, 0, 2, 1, 1, 3, 3, 1, 5, 3, 0, 5, 0, 5, 3, 7]
    ];

    const band_length = bands[0].length;

    let reelsContainer = new PIXI.Container();
    app.stage.addChild(reelsContainer);

    //create and display reels
    createAndDisplayReels(reel_indexes, bands, band_length, slotTextures, SYMBOL_WIDTH, SYMBOL_HEIGHT, reelsContainer);

    //add spin button to canvas
    addSpinButton(app, SYMBOL_WIDTH, SYMBOL_HEIGHT, startSpinning);

    //randomly generate indexes for reels
    function startSpinning() {
        //generate 5 random indexes
        for (let i = 0; i < 5; i++) {
            reel_indexes[i] = Math.floor(Math.random() * band_length);
        }

        clearContainers();
        //clear the existing reel canvas
        app.stage.removeChild(reelsContainer);
        //create new canvas
        reelsContainer = new PIXI.Container();
        app.stage.addChild(reelsContainer);


        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 5; j++) {
                let band_index = (reel_indexes[j] + i) % band_length;
                let symbol_index = bands[j][band_index]
                resulting_reels[i][j] = symbol_index;
                const tempSymbol = new PIXI.Sprite(slotTextures[symbol_index]);

                tempSymbol.x = j * SYMBOL_WIDTH;
                tempSymbol.y = i * SYMBOL_HEIGHT;
                tempSymbol.width = SYMBOL_WIDTH;
                tempSymbol.height = SYMBOL_HEIGHT;
                reelsContainer.addChild(tempSymbol);
            }
        }

        //call calculation method

        calculateWinnings();
    }
    //create new symbols on canvas

    //Do calculations
    function calculateWinnings() {

        //     reels
        //     [0, 1, 2, 3, 4],
        //     [5, 6, 7, 8, 9]
        //     [10, 11, 12, 13, 14]

        //initialize paylines
        const paylines = [
            [5, 6, 7, 8, 9],
            [0, 1, 2, 3, 4],
            [10, 11, 12, 13, 14],
            [0, 1, 7, 13, 14],
            [10, 11, 7, 3, 4],
            [0, 6, 12, 8, 4],
            [10, 6, 2, 3, 14]
        ]

        const paytable = [
            ["hv1", 10, 20, 50],
            ["hv2", 5, 10, 20],
            ["hv3", 5, 10, 15],
            ["hv4", 5, 10, 15],
            ["lv1", 2, 5, 10],
            ["lv2", 1, 2, 5],
            ["lv3", 1, 2, 3],
            ["lv4", 1, 2, 3]
        ]

        //iterate through paylines and calculate winnings of each row

        console.log(resulting_reels)

        let result_string = "Total wins: #totalWins \n";
        const payline_string = "- payline #id, #symbol x#matches, #payout \n";
        let winning_payline = "";
        let total_payout = 0;

        for (let i = 0; i < paylines.length; i++) {
            const payline = paylines[i];
            let payline_Index = payline[0];
            let symbol = resulting_reels[payline_Index / 5][payline_Index % 5]
            let symbol_count = 1;
            for (let j = 1; j < payline.length; j++) {
                payline_Index = payline[j];
                let curr_symbol = resulting_reels[Math.floor(payline_Index / 5)][payline_Index % 5]
                if (curr_symbol == symbol) {
                    symbol_count++;
                } else {
                    break;
                }
            }

            if (symbol_count > 2) {
                let payout = 0;

                if (symbol_count == 3) payout = paytable[symbol][1];
                else if (symbol_count == 4) payout = paytable[symbol][2];
                else if (symbol_count == 5) payout = paytable[symbol][3];

                total_payout = total_payout + payout;

                let temp_string = payline_string.replace("#id", i + 1).replace("#symbol", paytable[symbol][0]).replace("#matches", symbol_count).replace("#payout", payout);
                winning_payline = winning_payline + temp_string
            }


        }

        result_string = result_string.replace("#totalWins", total_payout);

        result_string = result_string + winning_payline;

        //display the winnings 
        displayWinning(result_string);
    }

    let winningContainer = null;

    function displayWinning(result_string) {

        //create canvas for results
        winningContainer = new PIXI.Container();
        app.stage.addChild(winningContainer);

        const style = new PIXI.TextStyle({
            marginTop: '1rem',
            fontSize: "15rem",
            fontWeight: 'bold',
            fill: 'white',
            stroke: { color: '#4a1850', width: 5, join: 'round' },
            dropShadow: {
                color: '#000000',
                blur: 4,
                angle: Math.PI / 6,
                distance: 6,
            },
            wordWrap: true,
            wordWrapWidth: 440,
        });

        const richText = new PIXI.Text({
            text: result_string,
            style,
        });

        richText.y = SYMBOL_HEIGHT * 4;
        richText.x = SYMBOL_WIDTH * 2;
        // richText.anchor = 0.5;

        winningContainer.addChild(richText);

        //show results
    }

    //clearContainers

    function clearContainers() {
        if (winningContainer != null) {
            app.stage.removeChild(winningContainer);
            winningContainer = null;
        }
    }


}

async function LoadAssets(app) {
    let loaderContainer = new PIXI.Container();

    let blackScreen = new PIXI.Graphics();
    blackScreen.beginFill("black");
    blackScreen.drawRect(0, 0, app.screen.width, app.screen.height);
    blackScreen.endFill();
    loaderContainer.addChild(blackScreen);
    loaderContainer.visible = true;

    const loaderStyle = new PIXI.TextStyle({
        fontSize: 24,
        fontWeight: 'bold',
        fill: 'white', // gradient
        stroke: '#4a1850',
        strokeThickness: 5,
        dropShadowAngle: Math.PI / 6,
        dropShadowDistance: 6,
        wordWrap: true,
        wordWrapWidth: 440,
        lineJoin: 'round',
    });

    let loaderText = new PIXI.Text('Loading ... 0%', loaderStyle);

    loaderText.x = app.screen.width / 2;
    loaderText.y = app.screen.height / 2;
    loaderText.anchor.set(0.5)


    loaderContainer.addChild(loaderText);
    app.stage.addChild(loaderContainer);
    // Load the textures
    await PIXI.Assets.load([
        'assets/hv1_symbol.png',
        'assets/hv2_symbol.png',
        'assets/hv3_symbol.png',
        'assets/hv4_symbol.png',
        'assets/lv1_symbol.png',
        'assets/lv2_symbol.png',
        'assets/lv3_symbol.png',
        'assets/lv4_symbol.png',
        'assets/spin_button.png'
    ], showProgress);

    loaderContainer.visible = false;

    function showProgress(e) {
        loaderContainer.removeChild(loaderText);
        let loaderPercentage = 'Loading ...' + Math.floor(e * 100) + '%'
        loaderText = new PIXI.Text(loaderPercentage, loaderStyle);
        loaderText.x = app.screen.width / 2;
        loaderText.y = app.screen.height / 2;
        loaderText.anchor.set(0.5)
        loaderContainer.addChild(loaderText);
    }
}

function createAndDisplayReels(reel_indexes, bands, band_length, slotTextures, SYMBOL_WIDTH, SYMBOL_HEIGHT, reelsContainer) {
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 5; j++) {
            let band_index = (reel_indexes[j] + i) % band_length;
            let symbol_index = bands[j][band_index]
            const symbol = new PIXI.Sprite(slotTextures[symbol_index]);

            symbol.x = j * SYMBOL_WIDTH;
            symbol.y = i * SYMBOL_HEIGHT;
            symbol.width = SYMBOL_WIDTH;
            symbol.height = SYMBOL_HEIGHT;
            reelsContainer.addChild(symbol);
        }
    }
}

function addSpinButton(app, SYMBOL_WIDTH, SYMBOL_HEIGHT, startSpinning) {
    const spinContainer = new PIXI.Container();
    app.stage.addChild(spinContainer);

    const spinTexture = PIXI.Texture.from('assets/spin_button.png');
    const spinSymbol = new PIXI.Sprite(spinTexture);

    spinSymbol.x = 2 * SYMBOL_WIDTH + 10;
    spinSymbol.y = 3 * SYMBOL_HEIGHT;
    spinSymbol.width = SYMBOL_WIDTH - 20;
    spinSymbol.height = SYMBOL_HEIGHT;
    spinContainer.addChild(spinSymbol);

    //add Reel symbol to canvas 

    //create click event on spin
    // Set the interactivity.
    spinContainer.eventMode = 'static';
    spinContainer.cursor = 'pointer';
    spinContainer.addListener('pointerdown', () => {
        startSpinning();
    });
}

// function startSpinning(reel_indexes, ) {
//     //generate 5 random indexes
//     for (let i = 0; i < 5; i++) {
//         reel_indexes[i] = Math.floor(Math.random() * band_length);
//     }

//     clearContainers();
//     //clear the existing reel canvas
//     app.stage.removeChild(reelsContainer);
//     //create new canvas
//     reelsContainer = new PIXI.Container();
//     app.stage.addChild(reelsContainer);


//     for (let i = 0; i < 3; i++) {
//         for (let j = 0; j < 5; j++) {
//             let band_index = (reel_indexes[j] + i) % band_length;
//             let symbol_index = bands[j][band_index]
//             resulting_reels[i][j] = symbol_index;
//             const tempSymbol = new PIXI.Sprite(slotTextures[symbol_index]);

//             tempSymbol.x = j * SYMBOL_WIDTH;
//             tempSymbol.y = i * SYMBOL_HEIGHT;
//             tempSymbol.width = SYMBOL_WIDTH;
//             tempSymbol.height = SYMBOL_HEIGHT;
//             reelsContainer.addChild(tempSymbol);
//         }
//     }

//     //call calculation method

//     calculateWinnings();
// }
