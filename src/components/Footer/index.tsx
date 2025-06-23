import React from 'react';
// @ts-ignore
import styles from './index.module.css'; // 确保路径正确

const Footer: React.FC = () => {
  return (
    <footer className={styles['footer']}>
      <div className={styles['footer-content']}>
        <div className={styles['footer-section']}>
          <h3>关于我们</h3>
          <ul>
            <li><a href="/about">公司简介</a></li>
            <li><a href="/contact">联系我们</a></li>
            <li><a href="/careers">招贤纳士</a></li>
            <li><a href="/news">新闻中心</a></li>
          </ul>
        </div>

        <div className={styles['footer-section']}>
          <h3>帮助中心</h3>
          <ul>
            <li><a href="/faq">常见问题</a></li>
            <li><a href="/guide">购票指南</a></li>
            <li><a href="/refund">退票说明</a></li>
            <li><a href="/feedback">意见反馈</a></li>
          </ul>
        </div>

        <div className={styles['footer-section']}>
          <h3>商务合作</h3>
          <ul>
            <li><a href="/business">商务洽谈</a></li>
            <li><a href="/advertise">广告投放</a></li>
            <li><a href="/marketing">营销合作</a></li>
            <li><a href="/partners">合作伙伴</a></li>
          </ul>
        </div>

        <div className={styles['footer-section']}>
          <h3>关注我们</h3>
          <div className={styles['qrcode']}>
            <img src="/qrcode.png" alt="微信公众号" />
            <p>扫码关注公众号</p>
          </div>
        </div>
      </div>

      <div className={styles['footer-bottom']}>
        <div className={styles['footer-links']}>
          <a href="/terms">服务条款</a>
          <a href="/privacy">隐私政策</a>
          <a href="/copyright">版权声明</a>
          <a href="/sitemap">网站地图</a>
        </div>
        <div className={styles['copyright']}>
          © 2024 电影购票系统 版权所有 | 晋ICP备2025060785号
        </div>
      </div>
    </footer>
  );
};

export default Footer; 