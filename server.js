const express = require('express');
const { google } = require('googleapis');
const serviceAccount = require('./service-account-key.json'); // Archivo JSON de la Cuenta de Servicio
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Configurar la autenticación con la Cuenta de Servicio
const auth = new google.auth.GoogleAuth({
    credentials: serviceAccount,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

// Ruta para guardar datos en Google Sheets
app.post('/guardar-datos', async (req, res) => {
    const { sheetId, sheetName, datos } = req.body;

    if (!sheetId || !sheetName || !datos) {
        return res.status(400).send('Faltan el ID de la hoja, el nombre de la hoja o los datos.');
    }

    try {
        const sheets = google.sheets({ version: 'v4', auth });

        // Obtener la próxima fila vacía
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: sheetId,
            range: `${sheetName}!A10:A`,
        });

        const nextRow = response.data.values ? response.data.values.length + 10 : 10;
        const range = `${sheetName}!A${nextRow}:F${nextRow}`;

        // Guardar los datos
        await sheets.spreadsheets.values.update({
            spreadsheetId: sheetId,
            range,
            valueInputOption: 'RAW',
            resource: {
                values: [datos],
            },
        });

        res.send('Datos guardados correctamente.');
    } catch (error) {
        console.error('Error al guardar datos:', error);
        res.status(500).send('Error al guardar los datos.');
    }
});

// Iniciar el servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
