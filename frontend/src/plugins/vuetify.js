import { createVuetify } from 'vuetify'
import 'vuetify/styles'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import '@mdi/font/css/materialdesignicons.css'

const vuetify = createVuetify({
    components,
    directives,
    icons: {
        defaultSet: 'mdi',
    },
    theme: {
        defaultTheme: 'light',
        themes: {
            light: {
                colors: {
                    primary: '#FFCC00', // Maagap yellow
                    secondary: '#424242', // Dark gray
                    accent: '#82B1FF', // Light blue
                    error: '#FF5252', // Red
                    info: '#2196F3', // Blue
                    success: '#4CAF50', // Green
                    warning: '#FFC107', // Yellow
                },
            },
            dark: {
                colors: {
                    primary: '#FFCC00', // Maagap yellow
                    secondary: '#424242', // Dark gray
                    accent: '#82B1FF', // Light blue
                    error: '#FF5252', // Red
                    info: '#2196F3', // Blue
                    success: '#4CAF50', // Green
                    warning: '#FFC107', // Yellow
                },
            },
        },
    },  
    defaults: {
        global: {
            style: {
                fontFamily: 'Gotham Medium',
            }
        },
    },
});

export default vuetify;