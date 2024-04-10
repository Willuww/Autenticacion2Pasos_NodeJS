//const { generateSecret } = require("speakeasy")

const express = require("express");
const { authenticator } = require("otplib");
const qrcode = require("qrcode");

const app = express();

app.set("view engine", "ejs");
app.use(express.urlencoded({extended: false}));

//genera una llave secreta para el usuario
const generateSecret = () => authenticator.generateSecret();

//genera el OTP para el usuario

const generateOTP = secret => authenticator.generate(secret);

///verifica la entrada del OTP
const verifyOTP = (secret, token) => authenticator.verify({secret, token});

//generador del codigo qr para la autenticacion
const generateQRCode = async secret => {
    const otpauthURL = authenticator.keyuri("user@example.com", "MyApp", secret);
    try{
        const qrImage = await qrcode.toDataURL(otpauthURL);
        return qrImage;
    }catch (error){
        console.error("Error generating qr", error);
        return null;
    }
};

app.get("/", async (req, res) => {
    const secret = generateSecret();
    const qrCode = await generateQRCode(secret); //Genera codigo qr
    res.render("index",{secret, qrCode});
});

app.post("/verify", (req, res) =>{
    const {secret, token} = req.body;
    const isValid = verifyOTP(secret,token);
    res.render("result", {isValid});
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));