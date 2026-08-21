const fs = require('fs');
let content = fs.readFileSync('src/components/bank/WorkspaceMail.tsx', 'utf8');

content = content.replace("import React,\nimport { QRCodeSVG } from 'qrcode.react'; { useState, useRef, useEffect } from 'react';", "import React, { useState, useRef, useEffect } from 'react';\nimport { QRCodeSVG } from 'qrcode.react';");

fs.writeFileSync('src/components/bank/WorkspaceMail.tsx', content);
