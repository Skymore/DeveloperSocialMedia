const { createClient } = require('redis');

// 创建Redis客户端
let redisClient = createClient({
    // 如果你的Redis服务器运行在默认端口（6379）上，并且没有设置密码，那么你可以不传递任何参数
    // 对于非默认配置，请按照需要添加如 host、port、password 等选项
});

redisClient.on('error', function (error) {
    console.error(`Redis error: ${error}`);
});

// 连接到Redis服务器
const connectRedis = async () => {
    await redisClient.connect();
    console.log('Redis client connected');
};

connectRedis();

module.exports = redisClient;
