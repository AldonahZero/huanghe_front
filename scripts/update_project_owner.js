/*
 Node 脚本：将 projects 表中 owner_id 更新为指定 user_id（海绵老师）
 使用方法：
 1) 设置环境变量 DATABASE_URL，例如：export DATABASE_URL="postgresql://user:pass@host:5432/dbname"
 2) 运行：node scripts/update_project_owner.js --user-id=123 --dry-run

 参数：
 --user-id    要设置为 owner_id 的用户 id（必需）
 --dry-run    仅打印将执行的 SQL 而不实际执行
 --confirm    跳过交互确认直接执行

 警告：请先运行 scripts/find_user_id.sql 获取正确的 user_id。
*/

const { Client } = require('pg');
const argv = require('minimist')(process.argv.slice(2));

async function main() {
    const userId = argv['user-id'];
    const dryRun = argv['dry-run'] || false;
    const confirm = argv['confirm'] || false;

    if (!userId) {
        console.error('请提供 --user-id 参数（来自 scripts/find_user_id.sql 的结果）');
        process.exit(2);
    }

    const sql = `UPDATE projects SET owner = $1 WHERE owner != $1 RETURNING id, name, owner;`;

    console.log('准备将 projects 表中的 owner 更新为用户 id:', userId);
    console.log('SQL:', sql.replace('$1', userId));

    if (dryRun) {
        console.log('dry-run 模式，未执行任何写操作。');
        process.exit(0);
    }

    if (!confirm) {
        const readline = require('readline');
        const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
        const answer = await new Promise((res) => rl.question('确认执行更新？这将修改数据库中的数据 (yes/no): ', res));
        rl.close();
        if (answer.trim().toLowerCase() !== 'yes') {
            console.log('已取消。');
            process.exit(0);
        }
    }

    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
        console.error('请先设置环境变量 DATABASE_URL，例如: export DATABASE_URL="postgresql://user:pass@host:5432/dbname"');
        process.exit(2);
    }

    const client = new Client({ connectionString });
    await client.connect();

    try {
        const res = await client.query(sql, [userId]);
        console.log('更新完成，受影响行数:', res.rowCount);
        res.rows.slice(0, 20).forEach((r) => console.log(r));
    } catch (err) {
        console.error('执行失败:', err);
    } finally {
        await client.end();
    }
}

main();
