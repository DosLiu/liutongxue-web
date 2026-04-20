import wechatQr from '../assets/contact/wechat-qr.jpg';
import feishuQr from '../assets/contact/feishu-qr.jpg';
import './StartBuildingSection.css';

export default function StartBuildingSection() {
  return (
    <section className="start-building-section" aria-labelledby="start-building-title">
      <div className="start-building-container">
        <div className="start-building-card">
          <h2 id="start-building-title" className="start-building-title">
            与我链接
          </h2>
          <p className="start-building-description">聊合作、产品想法或内容实验，扫码就好。</p>
        </div>

        <div className="contact-qr-grid" aria-label="联系二维码">
          <figure className="contact-qr-card">
            <img
              className="contact-qr-image"
              src={wechatQr}
              alt="微信二维码"
              loading="lazy"
              decoding="async"
            />
            <figcaption className="contact-qr-caption">微信</figcaption>
          </figure>

          <figure className="contact-qr-card">
            <img
              className="contact-qr-image"
              src={feishuQr}
              alt="飞书二维码"
              loading="lazy"
              decoding="async"
            />
            <figcaption className="contact-qr-caption">飞书</figcaption>
          </figure>
        </div>
      </div>
    </section>
  );
}
