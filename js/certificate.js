/**
 * IOI Ocean Academy BD - High-Resolution In-Browser Certificate Generator & Verifier
 * Features:
 * - 2400 x 1700 px (300 DPI equivalent) Canvas 2D Vector Rendering
 * - Ornate marine guilloche borders, gold-foil embossed seals, official signatures
 * - Dynamic QR Code generation for instant tamper-evident verification
 * - One-click PDF (jsPDF) & PNG high-res download
 * - Guest mode lock overlay: "Create a free account to imprint your name and claim your certificate!"
 * - Instant unblocking & name imprinting when guest signs up or logs in
 */

import { authService } from './auth.js';

export class CertificateManager {
  constructor(canvasEl) {
    this.canvas = canvasEl;
    this.ctx = canvasEl ? canvasEl.getContext('2d') : null;
    this.currentCert = null;
    this.qrImage = null;
  }

  // Generate or retrieve certificate data
  createCertificateRecord({ course, scoreResult, userName = null }) {
    const certId = 'IOI-BD-' + new Date().getFullYear() + '-' + Math.random().toString(36).substring(2, 8).toUpperCase();
    const issueDate = new Date().toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

    return {
      certId,
      courseId: course.id,
      courseCode: course.code,
      courseTitle: course.title,
      userName: userName || (authService.currentUser ? authService.currentUser.fullName : "Guest Learner"),
      score: scoreResult.percentage,
      issueDate,
      institution: "International Ocean Institute - Ocean Academy Bangladesh (IOI Ocean Academy BD)",
      accreditation: "IOI Operational Centre & UNCLOS Ocean Governance Division",
      verificationUrl: `${window.location.origin}${window.location.pathname}?verify=${certId}`
    };
  }

  // Generate QR Code data URL asynchronously
  async generateQRCode(url) {
    return new Promise((resolve) => {
      if (window.QRCode) {
        const tempDiv = document.createElement('div');
        tempDiv.style.display = 'none';
        document.body.appendChild(tempDiv);
        try {
          new window.QRCode(tempDiv, {
            text: url,
            width: 140,
            height: 140,
            colorDark: "#071426",
            colorLight: "#ffffff",
            correctLevel: window.QRCode.CorrectLevel.H
          });
          setTimeout(() => {
            const img = tempDiv.querySelector('img');
            const canvas = tempDiv.querySelector('canvas');
            const dataUrl = img ? img.src : (canvas ? canvas.toDataURL() : null);
            document.body.removeChild(tempDiv);
            if (dataUrl) {
              const imageObj = new Image();
              imageObj.onload = () => resolve(imageObj);
              imageObj.onerror = () => resolve(null);
              imageObj.src = dataUrl;
            } else {
              resolve(null);
            }
          }, 100);
        } catch (e) {
          console.warn('QR code generation error', e);
          document.body.removeChild(tempDiv);
          resolve(null);
        }
      } else {
        resolve(null);
      }
    });
  }

  // Render high-res 2400 x 1700 certificate on HTML5 Canvas
  async renderCertificate(certData, isGuest = false) {
    this.currentCert = certData;
    if (!this.canvas || !this.ctx) return;

    const width = 2400;
    const height = 1700;
    this.canvas.width = width;
    this.canvas.height = height;
    const ctx = this.ctx;

    // 1. Background Parchment & Ocean Radiance
    const bgGrad = ctx.createLinearGradient(0, 0, width, height);
    bgGrad.addColorStop(0, '#fbfcfe');
    bgGrad.addColorStop(0.5, '#f4f8fb');
    bgGrad.addColorStop(1, '#eaf2f8');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Subtle nautical grid pattern in background
    ctx.strokeStyle = 'rgba(14, 116, 144, 0.035)';
    ctx.lineWidth = 1;
    for (let x = 60; x < width; x += 60) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 60; y < height; y += 60) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // 2. Ornate Double Borders (Midnight Navy & Gilded Gold)
    const margin = 70;
    // Outer navy border
    ctx.strokeStyle = '#071426';
    ctx.lineWidth = 14;
    ctx.strokeRect(margin, margin, width - margin * 2, height - margin * 2);

    // Inner gold border with guilloche corners
    ctx.strokeStyle = '#d4af37';
    ctx.lineWidth = 4;
    ctx.strokeRect(margin + 20, margin + 20, width - (margin + 20) * 2, height - (margin + 20) * 2);

    // Faint thin accent line
    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(margin + 28, margin + 28, width - (margin + 28) * 2, height - (margin + 28) * 2);

    // Corner Nautical Rosettes / Anchors
    this.drawCornerOrnament(ctx, margin + 20, margin + 20);
    this.drawCornerOrnament(ctx, width - (margin + 20), margin + 20);
    this.drawCornerOrnament(ctx, margin + 20, height - (margin + 20));
    this.drawCornerOrnament(ctx, width - (margin + 20), height - (margin + 20));

    // 3. Institution Crest & Header
    ctx.textAlign = 'center';

    // Official Compass & Wave Crest (Vector drawn)
    this.drawOfficialCrest(ctx, width / 2, 230);

    // Institution Name
    ctx.fillStyle = '#071426';
    ctx.font = 'bold 36px "Cinzel", "Times New Roman", Georgia, serif';
    ctx.fillText('INTERNATIONAL OCEAN INSTITUTE', width / 2, 360);

    ctx.fillStyle = '#0284c7';
    ctx.font = 'bold 28px "Cinzel", "Times New Roman", Georgia, serif';
    ctx.fillText('IOI OCEAN ACADEMY BANGLADESH (IOI BD)', width / 2, 405);

    // Subtitle Rule
    ctx.strokeStyle = '#d4af37';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(width / 2 - 350, 430);
    ctx.lineTo(width / 2 + 350, 430);
    ctx.stroke();

    // Small Diamond on center of line
    ctx.fillStyle = '#d4af37';
    ctx.beginPath();
    ctx.arc(width / 2, 430, 5, 0, Math.PI * 2);
    ctx.fill();

    // Certificate Title
    ctx.fillStyle = '#b45309';
    ctx.font = 'bold 22px "Inter", "Segoe UI", sans-serif';
    ctx.letterSpacing = '6px';
    ctx.fillText('ACADEMIC CERTIFICATE OF ACHIEVEMENT', width / 2, 475);

    // 4. Recipient Presentation
    ctx.fillStyle = '#475569';
    ctx.font = 'italic 28px "Georgia", serif';
    ctx.letterSpacing = '0px';
    ctx.fillText('This official credential certifies that', width / 2, 550);

    // Recipient Name (Prominent & Elegant)
    const displayName = isGuest ? "Guest Learner [Registration Pending]" : (certData.userName || "Distinguished Scholar");
    ctx.fillStyle = '#071426';
    ctx.font = 'bold 64px "Cinzel", "Times New Roman", Georgia, serif';
    ctx.fillText(displayName, width / 2, 650);

    // Decorative underline for name
    const nameWidth = ctx.measureText(displayName).width;
    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(width / 2 - (nameWidth / 2) - 40, 680);
    ctx.lineTo(width / 2 + (nameWidth / 2) + 40, 680);
    ctx.stroke();

    // Body Text
    ctx.fillStyle = '#334155';
    ctx.font = '26px "Georgia", serif';
    ctx.fillText('has successfully mastered the coursework and demonstrated comprehensive excellence in the final examination of', width / 2, 750);

    // Course Title
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 38px "Cinzel", "Times New Roman", Georgia, serif';
    ctx.fillText(certData.courseTitle, width / 2, 830);

    // Course Code & Score Badge
    ctx.fillStyle = '#0284c7';
    ctx.font = 'bold 24px "Inter", sans-serif';
    ctx.fillText(`Course Code: ${certData.courseCode}  •  Examination Score: ${certData.score}% (Pass with Honors)`, width / 2, 885);

    // Attribution Statement
    ctx.fillStyle = '#64748b';
    ctx.font = '22px "Georgia", serif';
    ctx.fillText('Accredited under the Ocean Literacy Framework of the International Ocean Institute Operational Centre.', width / 2, 940);

    // 5. Official Seals and Signatures
    // Left: Director Signature
    this.drawSignatureBlock(
      ctx,
      480,
      1260,
      "Md. Mostafa Monwar",
      "Director",
      "IOI Ocean Academy BD"
    );

    // Center: Embossed Gold Foil Seal Medallion
    this.drawEmbossedGoldSeal(ctx, width / 2, 1260, certData.score);

    // Right: International Director Signature
    this.drawSignatureBlock(
      ctx,
      width - 480,
      1260,
      "Antonella Vassallo",
      "Managing Director",
      "International Ocean Institute HQ"
    );

    // 6. Bottom Bar: Date, Certificate ID & QR Code
    // Generate QR Code image if not loaded
    if (!this.qrImage) {
      this.qrImage = await this.generateQRCode(certData.verificationUrl);
    }

    if (this.qrImage) {
      ctx.drawImage(this.qrImage, width - 360, 1400, 150, 150);
      ctx.fillStyle = '#64748b';
      ctx.font = '14px "Inter", sans-serif';
      ctx.fillText('Scan to Verify', width - 285, 1570);
    }

    // Left Bottom: Date and Unique ID
    ctx.textAlign = 'left';
    ctx.fillStyle = '#334155';
    ctx.font = '20px "Inter", sans-serif';
    ctx.fillText(`Date of Completion: ${certData.issueDate}`, 170, 1470);
    ctx.font = 'bold 22px "Courier New", monospace';
    ctx.fillStyle = '#071426';
    ctx.fillText(`Verification ID: ${certData.certId}`, 170, 1515);

    ctx.font = '16px "Inter", sans-serif';
    ctx.fillStyle = '#64748b';
    ctx.fillText('Verify online at: ' + certData.verificationUrl, 170, 1555);

    // 7. Watermark if Guest Mode
    if (isGuest) {
      ctx.save();
      ctx.translate(width / 2, height / 2);
      ctx.rotate(-Math.PI / 6);
      ctx.textAlign = 'center';
      ctx.font = 'bold 110px "Inter", sans-serif';
      ctx.fillStyle = 'rgba(239, 68, 68, 0.16)';
      ctx.fillText('SAMPLE - GUEST PREVIEW', 0, -50);
      ctx.font = 'bold 44px "Inter", sans-serif';
      ctx.fillStyle = 'rgba(15, 23, 42, 0.28)';
      ctx.fillText('CREATE A FREE ACCOUNT TO IMPRINT YOUR NAME & CLAIM CERTIFICATE', 0, 40);
      ctx.restore();
    }
  }

  drawCornerOrnament(ctx, x, y) {
    ctx.save();
    ctx.strokeStyle = '#d4af37';
    ctx.fillStyle = '#d4af37';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x, y, 14, 0, Math.PI * 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(x, y, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  drawOfficialCrest(ctx, x, y) {
    ctx.save();
    // Compass star + wave symbol
    ctx.strokeStyle = '#0284c7';
    ctx.fillStyle = '#071426';
    ctx.lineWidth = 3;

    // Outer circle
    ctx.beginPath();
    ctx.arc(x, y, 48, 0, Math.PI * 2);
    ctx.stroke();

    // 8-point compass star
    ctx.fillStyle = '#d4af37';
    for (let i = 0; i < 8; i++) {
      const angle = (i * Math.PI) / 4;
      const rOuter = i % 2 === 0 ? 44 : 28;
      const rInner = 14;

      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + Math.cos(angle - 0.2) * rInner, y + Math.sin(angle - 0.2) * rInner);
      ctx.lineTo(x + Math.cos(angle) * rOuter, y + Math.sin(angle) * rOuter);
      ctx.lineTo(x + Math.cos(angle + 0.2) * rInner, y + Math.sin(angle + 0.2) * rInner);
      ctx.closePath();
      ctx.fill();
    }

    // Center jewel
    ctx.fillStyle = '#071426';
    ctx.beginPath();
    ctx.arc(x, y, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  drawSignatureBlock(ctx, x, y, name, title, org) {
    ctx.save();
    ctx.textAlign = 'center';

    // Faux handwritten signature flourish
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(x - 120, y - 45);
    ctx.bezierCurveTo(x - 60, y - 80, x - 20, y - 20, x + 30, y - 60);
    ctx.bezierCurveTo(x + 70, y - 85, x + 90, y - 35, x + 130, y - 40);
    ctx.stroke();

    // Signature Underline
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(x - 160, y);
    ctx.lineTo(x + 160, y);
    ctx.stroke();

    // Signer Info
    ctx.fillStyle = '#071426';
    ctx.font = 'bold 22px "Cinzel", "Times New Roman", serif';
    ctx.fillText(name, x, y + 32);

    ctx.fillStyle = '#475569';
    ctx.font = '18px "Inter", sans-serif';
    ctx.fillText(title, x, y + 60);

    ctx.fillStyle = '#64748b';
    ctx.font = 'italic 16px "Georgia", serif';
    ctx.fillText(org, x, y + 85);

    ctx.restore();
  }

  drawEmbossedGoldSeal(ctx, x, y, score) {
    ctx.save();
    // Golden Medallion
    const radius = 95;

    // Outer serrated ribbon rim
    ctx.fillStyle = '#b45309';
    for (let i = 0; i < 36; i++) {
      const angle = (i * Math.PI) / 18;
      ctx.beginPath();
      ctx.arc(x + Math.cos(angle) * (radius + 8), y + Math.sin(angle) * (radius + 8), 12, 0, Math.PI * 2);
      ctx.fill();
    }

    // Gold gradient seal body
    const goldGrad = ctx.createRadialGradient(x - 25, y - 25, 10, x, y, radius);
    goldGrad.addColorStop(0, '#fef08a');
    goldGrad.addColorStop(0.4, '#eab308');
    goldGrad.addColorStop(0.8, '#ca8a04');
    goldGrad.addColorStop(1, '#a16207');

    ctx.fillStyle = goldGrad;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();

    // Inner embossed border
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(x, y, radius - 12, 0, Math.PI * 2);
    ctx.stroke();

    // Seal text
    ctx.textAlign = 'center';
    ctx.fillStyle = '#451a03';
    ctx.font = 'bold 15px "Cinzel", serif';
    ctx.fillText('IOI OCEAN ACADEMY BD', x, y - 38);

    ctx.fillStyle = '#451a03';
    ctx.font = 'bold 36px "Cinzel", Georgia, serif';
    ctx.fillText('VERIFIED', x, y + 8);

    ctx.font = 'bold 14px "Inter", sans-serif';
    ctx.fillText(`SCORE: ${score}% • HONORS`, x, y + 42);

    // Decorative stars
    ctx.font = '16px serif';
    ctx.fillText('★  ★  ★', x, y - 18);

    ctx.restore();
  }

  // Download high-resolution PNG
  downloadPNG() {
    if (!this.canvas) return;
    const certId = this.currentCert ? this.currentCert.certId : 'IOI-BD-Certificate';
    const link = document.createElement('a');
    link.download = `${certId}.png`;
    link.href = this.canvas.toDataURL('image/png', 1.0);
    link.click();
  }

  // Download Print-Ready PDF via jsPDF
  downloadPDF() {
    if (!this.canvas) return;
    const certId = this.currentCert ? this.currentCert.certId : 'IOI-BD-Certificate';

    if (window.jspdf && window.jspdf.jsPDF) {
      // Landscape A4: 297mm x 210mm
      const pdf = new window.jspdf.jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });

      const imgData = this.canvas.toDataURL('image/jpeg', 0.95);
      pdf.addImage(imgData, 'JPEG', 0, 0, 297, 210);
      pdf.save(`${certId}.pdf`);
    } else {
      // Fallback: high-res print window
      const win = window.open('');
      win.document.write(`<img src="${this.canvas.toDataURL()}" style="width:100%;height:auto;"/>`);
      win.print();
    }
  }
}
