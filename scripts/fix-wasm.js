const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const webDistDir = path.join(__dirname, '../dist/_expo/static/js/web');

if (!fs.existsSync(webDistDir)) {
    console.error(`Directory ${webDistDir} does not exist.`);
    process.exit(1);
}

const files = fs.readdirSync(webDistDir);
let workerFilesFixed = [];

for (const file of files) {
    if (!file.endsWith('.js')) continue;

    const filePath = path.join(webDistDir, file);
    let content = fs.readFileSync(filePath, 'utf8');

    const regex = /\/assets\/node_modules\/expo-sqlite\/web\/wa-sqlite\/wa-sqlite\.[a-z0-9]+\.wasm/g;

    if (regex.test(content)) {
        console.log(`Fixing WASM path in: ${file}`);
        content = content.replace(regex, '/wa-sqlite.wasm');

        // Tạo hash mới cho nội dung file để buộc browser tải lại bản mới (busting cache)
        const hash = crypto.createHash('md5').update(content).digest('hex').substr(0, 16);
        const fileNameWithoutHash = file.replace(/\.[a-z0-9]+\.js$/, ''); // loại bỏ hash cũ
        const newFileName = `${fileNameWithoutHash}.${hash}.js`;
        const newFilePath = path.join(webDistDir, newFileName);

        fs.writeFileSync(newFilePath, content, 'utf8');
        fs.unlinkSync(filePath); // xóa file cũ

        workerFilesFixed.push({ old: file, new: newFileName });
        console.log(`Renamed ${file} to ${newFileName} to bust cache.`);
    }
}

// Nếu tên file bị đổi, cần thay thế tham chiếu trong tất cả các file JS khác
if (workerFilesFixed.length > 0) {
    const allFiles = fs.readdirSync(webDistDir);
    for (const file of allFiles) {
        if (!file.endsWith('.js')) continue;
        const filePath = path.join(webDistDir, file);
        let content = fs.readFileSync(filePath, 'utf8');
        let changed = false;
        for (const fixed of workerFilesFixed) {
            if (content.includes(fixed.old)) {
                content = content.replace(new RegExp(fixed.old, 'g'), fixed.new);
                changed = true;
            }
        }
        if (changed) {
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`Updated references in ${file}`);
        }
    }
}

// Ensure wasm is copied
const wasmSourceDir = path.join(__dirname, '../node_modules/expo-sqlite/web/wa-sqlite');
const wasmSourcePath = fs.readdirSync(wasmSourceDir).find(f => f.endsWith('.wasm'));

if (wasmSourcePath) {
    fs.copyFileSync(
        path.join(wasmSourceDir, wasmSourcePath),
        path.join(__dirname, '../dist/wa-sqlite.wasm')
    );
    console.log(`Copied ${wasmSourcePath} to dist/wa-sqlite.wasm`);
}
