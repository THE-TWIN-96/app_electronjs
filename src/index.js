//Inicializa la aplicación.
const { app, BrowserWindow, Menu, ipcMain } = require('electron');
//URL es un paquete de Node para cargar archivos.
const url = require('url');
//Path es un paquete de Node para buscar archivos.
const path = require('path');


//Para que ejecute el reload solo cuando esté en desarrollo y no en producción.
if (process.env.NODE_ENV === 'production'){
    //Librería de Node para ver los cambios en tiempo real
    //sin estar cerrando y corriendo una y otras vez el proyecto.
    require('electron-reload')(__dirname, {
        //Configuración.
        //A parte de recargar cuando haya cambio en el código de las ventanas, 
        //que recargue también cuando haya cambios en el archivo principal de configuración.
        electron: path.join(__dirname, '../node_modules', '.bin', 'electron')
    })
}
//NOTA: esto de arriba es para poder usar las herramientas de 
//desarrollo, cuando process.env.NODE_ENV !== 'production'. 


//Variables para hacer las ventanas de abajo global 
//para que cuando se elimine, se liberen los recuersos de Windows.
let mainWindow;
let newProductWindow;


//Cuando la app esté lista (iniciada) haremos...
app.on('ready', () => {
    //Crear la ventana principal.
    mainWindow = new BrowserWindow({
        /*Propiedades de la ventana: ancho, alto, etc.*/
        width: 1600,
        height: 800,
        center: true,
        minHeight: 700,
        minWidth: 1200,
        //Al poner estas propiedades, solucioné el error de 
        //Uncaught ReferenceError: require is not defined.
        webPreferences: {
            contextIsolation: false,
            nodeIntegration: true,
            nodeIntegrationInWorker: true,
            enableRemoteModule: true
        }
    });
    //Lo que irá dentro de esa ventana: 
    mainWindow.loadURL(url.format({
        //Le doy donde y que archivo cargar
        pathname: path.join(__dirname, 'views/index.html'), 
        //Le doy que protocolo lo va a cargar.
        protocol: 'file',
        slashes: true
    }));

    //Crear nuestro propia Barra de Menú
    const mainMenu = Menu.buildFromTemplate(templateMenu);
    Menu.setApplicationMenu(mainMenu);

    //Escuchar el evento de cierre de la ventana principal
    mainWindow.on('closed', ()=>{
        //Cerrar toda la aplicación.
        app.quit();
    });
});


//Crear la ventana de la opción New Product.
function createnewProductWindow(){
    newProductWindow = new BrowserWindow({
        title: 'Add A New Product',
        width: 400,
        height: 360,
        center: true,
        //minHeight: 700,
        //minWidth: 1200,
        //Al poner estas propiedades, solucioné el error de 
        //Uncaught ReferenceError: require is not defined.
        webPreferences: {
            contextIsolation: false,
            nodeIntegration: true,
            nodeIntegrationInWorker: true,
            enableRemoteModule: true
        }
    });
    
    newProductWindow.loadURL(url.format({
        //Le doy donde y que archivo cargar
        pathname: path.join(__dirname, 'views/new-product.html'), 
        //Le doy que protocolo lo va a cargar.
        protocol: 'file',
        slashes: true
    }));
    
    //Quitar el menú por defecto.
    //newProductWindow.setMenu(null);

    //Escuchar el evento de cierre de la ventana principal
    newProductWindow.on('closed', ()=>{
        //Cerrar esta ventana.
        newProductWindow = null;
    });
}


//Escuchando el evento del archivo new-product.html por donde viene el nuevo producto
ipcMain.on('new-product', (e, newProduct) => {
    //console.log(newProduct);
    //Así se envía un producto.
    mainWindow.webContents.send('new-product', newProduct);

    //Lueo que se haa enviado el nuevo producto de la ventana new-product.html a la ventana principal, se elimina la ventana new-product.html.
    newProductWindow.close();
});


//Opciones de mi menú.
const templateMenu = [
    {
        label: 'File',
        submenu: [
            {
                //Nombre de la opción.
                label: 'New Product',
                //Atajo de teclado de la opción.
                accelerator: 'Ctrl+N',
                //Al dar click: ...
                click(){
                    createnewProductWindow();
                }
            },
            {
                label: 'Remove All Products',
                accelerator: 'Ctrl+R',
                click(){
                    mainWindow.webContents.send('remove-all-product');
                }
            },
            {
                label: 'Exit',
                accelerator: process.platform == 'darwin' ? 'command+Q' : 'Ctrl+Q',
                click(){
                    app.quit();
                }
            }
        ]
    }    
];


//Si la plataforma es Mac, mostrar el nombre de la aplicación 
//como primera pestaña en la barra de Menú.
if (process.platform === 'darwin'){
    //Obtener el nombre de la aplicación.
    templateMenu.unshift({
        label: app.getName()
    });
}

//Agregar las herramientas de desarrollo en la barra de Menú.
if (process.env.NODE_ENV === 'production'){
    templateMenu.push({
        label: 'DevTools',
        submenu: [
            {
                label: 'Show/Hide Dev Tools',
                accelerator: 'Ctrl+D',
                click(item, focusedWindow){
                    focusedWindow.toggleDevTools();
                }
            },
            {
                role: 'reload'
            }
        ]
    });
}
//NOTA: esto de arriba es para mostrar las herramientas de 
//desarrollo, cuando process.env.NODE_ENV !== 'production'. 