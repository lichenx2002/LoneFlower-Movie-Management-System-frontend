/**
 * 图片代理工具函数
 * 用于解决跨域图片访问问题
 */

// 方案1：使用图片代理服务
export const getProxiedImageUrl = (originalUrl: string): string => {
  if (!originalUrl) return '';

  // 使用免费的图片代理服务
  // 注意：这些服务可能有访问限制，建议在生产环境使用自己的代理服务
  const proxyServices = [
    `https://images.weserv.nl/?url=${encodeURIComponent(originalUrl)}`,
    `https://cors-anywhere.herokuapp.com/${originalUrl}`,
    `https://api.allorigins.win/raw?url=${encodeURIComponent(originalUrl)}`
  ];

  // 随机选择一个代理服务
  const randomIndex = Math.floor(Math.random() * proxyServices.length);
  return proxyServices[randomIndex];
};

// 方案2：使用本地占位图片
export const getFallbackImageUrl = (): string => {
  return 'https://via.placeholder.com/300x420/cccccc/666666?text=No+Image';
};

// 方案3：检查图片是否可访问
export const checkImageAccessible = (url: string): Promise<boolean> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = url;
  });
};

// 方案4：获取最佳图片URL
export const getBestImageUrl = async (originalUrl: string): Promise<string> => {
  if (!originalUrl) return getFallbackImageUrl();

  // 首先尝试直接访问
  const isDirectAccessible = await checkImageAccessible(originalUrl);
  if (isDirectAccessible) {
    return originalUrl;
  }

  // 如果直接访问失败，使用代理
  return getProxiedImageUrl(originalUrl);
}; 