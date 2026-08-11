import jsPDF from 'jspdf';
import { FAMOUS_INDIAN_STATES_DATA } from '../data/famousIndianStatesData';
import { TripPlan } from '../types';

export async function generateFamousPlacesPdf(): Promise<void> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'a4', // 595.28 x 841.89 points
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 30;
  const contentWidth = pageWidth - margin * 2;

  let yPos = 40;

  // Title Banner
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(26, 54, 93); // #1A365D
  doc.text('Famous Places Across All States & Union Territories of India', pageWidth / 2, yPos, { align: 'center' });

  yPos += 20;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(74, 85, 104); // #4A5568
  doc.text('A Complete Guide covering 28 States & 8 Union Territories (10 Famous Places Each)', pageWidth / 2, yPos, { align: 'center' });

  yPos += 25;

  // Draw dividing header line
  doc.setDrawColor(226, 232, 240); // #E2E8F0
  doc.setLineWidth(1);
  doc.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 20;

  for (let i = 0; i < FAMOUS_INDIAN_STATES_DATA.length; i++) {
    const item = FAMOUS_INDIAN_STATES_DATA[i];

    // Check page height space left before adding state box
    const requiredHeight = 175;
    if (yPos + requiredHeight > pageHeight - margin) {
      doc.addPage();
      yPos = 40;
    }

    // State Title
    const entityType = item.type || (item.stateNum <= 28 ? 'State' : 'Union Territory');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(43, 108, 176); // #2B6CB0
    doc.text(`${item.stateNum}. ${item.state} (${entityType})`, margin, yPos);

    yPos += 12;

    // Outer Box
    const boxX = margin;
    const boxY = yPos;
    const boxWidth = contentWidth;
    const boxHeight = 150;

    // Draw background filled rectangle #F7FAFC
    doc.setFillColor(247, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.8);
    doc.roundedRect(boxX, boxY, boxWidth, boxHeight, 6, 6, 'FD');

    // Left column: Image / Placeholder
    const imgX = boxX + 10;
    const imgY = boxY + 10;
    const imgWidth = 190;
    const imgHeight = 130;

    try {
      // Create image in canvas to load safely without CORS block
      const img = await loadImageAsDataUrl(item.imageUrl);
      if (img) {
        doc.addImage(img, 'JPEG', imgX, imgY, imgWidth, imgHeight, undefined, 'FAST');
      } else {
        drawFallbackImagePlaceholder(doc, imgX, imgY, imgWidth, imgHeight, item.state);
      }
    } catch {
      drawFallbackImagePlaceholder(doc, imgX, imgY, imgWidth, imgHeight, item.state);
    }

    // Right column: Places List
    const placesX = imgX + imgWidth + 15;
    let placeY = boxY + 22;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(45, 55, 72); // #2D3748

    // Print places in 2 sub-columns inside the right box area
    const col1 = item.places.slice(0, 5);
    const col2 = item.places.slice(5, 10);

    const subCol1X = placesX;
    const subCol2X = placesX + 150;

    for (let pIdx = 0; pIdx < 5; pIdx++) {
      const p1 = col1[pIdx];
      const p2 = col2[pIdx];

      if (p1) {
        const text1 = `• ${p1.name}`;
        const truncated1 = text1.length > 25 ? text1.substring(0, 24) + '…' : text1;
        doc.text(truncated1, subCol1X, placeY);
      }

      if (p2) {
        const text2 = `• ${p2.name}`;
        const truncated2 = text2.length > 25 ? text2.substring(0, 24) + '…' : text2;
        doc.text(truncated2, subCol2X, placeY);
      }

      placeY += 22;
    }

    yPos = boxY + boxHeight + 20;
  }

  // Footer / Page numbers
  const totalPages = doc.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8);
    doc.setTextColor(160, 174, 192);
    doc.text(
      `Velora AI Tourist Guide • Page ${p} of ${totalPages} • Generated Export`,
      pageWidth / 2,
      pageHeight - 18,
      { align: 'center' }
    );
  }

  doc.save('famous_places_india.pdf');
}

export async function exportTripToPDF(trip: TripPlan): Promise<void> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 35;
  let yPos = 40;

  // Header Banner
  doc.setFillColor(22, 61, 50); // Velora Forest Green
  doc.rect(0, 0, pageWidth, 75, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(231, 199, 95); // Gold Accent
  doc.text('VELORA AI', margin, 38);

  doc.setFontSize(10);
  doc.setTextColor(255, 255, 255);
  doc.text('Smart AI Travel Twin & Custom Itinerary Report', margin, 55);

  yPos = 100;

  // Trip Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(21, 21, 21);
  doc.text(`Destination: ${trip.destination || 'India Tour'}`, margin, yPos);

  yPos += 20;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`Duration: ${trip.durationDays || 3} Days  |  Style: ${trip.travelStyle || 'Cultural'}  |  Estimated Budget: Rs. ${Math.round((trip.totalBudgetUsd || 180) * 83.75).toLocaleString()}`, margin, yPos);

  yPos += 25;
  doc.setDrawColor(220, 220, 220);
  doc.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 20;

  // Overview
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(22, 61, 50);
  doc.text('Itinerary Overview', margin, yPos);

  yPos += 15;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(50, 50, 50);
  const splitOverview = doc.splitTextToSize(trip.summary || 'Custom AI-generated travel plan.', pageWidth - margin * 2);
  doc.text(splitOverview, margin, yPos);

  yPos += splitOverview.length * 14 + 20;

  // Daily Itinerary Days
  if (trip.itinerary && trip.itinerary.length > 0) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(22, 61, 50);
    doc.text('Day-by-Day Itinerary Schedule', margin, yPos);
    yPos += 18;

    for (const dayItem of trip.itinerary) {
      if (yPos > pageHeight - 80) {
        doc.addPage();
        yPos = 40;
      }

      doc.setFillColor(246, 243, 236);
      doc.roundedRect(margin, yPos, pageWidth - margin * 2, 22, 4, 4, 'F');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(199, 107, 69); // Terracotta
      doc.text(`Day ${dayItem.day}: ${dayItem.title || 'Exploration Phase'}`, margin + 10, yPos + 15);

      yPos += 30;

      if (dayItem.nodes && dayItem.nodes.length > 0) {
        for (const node of dayItem.nodes) {
          if (yPos > pageHeight - 60) {
            doc.addPage();
            yPos = 40;
          }

          const actText = `• [${node.category.toUpperCase()}] ${node.name}: ${node.description || ''}`;
          const splitAct = doc.splitTextToSize(actText, pageWidth - margin * 2 - 15);
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(9);
          doc.setTextColor(40, 40, 40);
          doc.text(splitAct, margin + 10, yPos);
          yPos += splitAct.length * 12 + 4;
        }
      }
      yPos += 10;
    }
  }

  // Footer
  const totalPages = doc.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `Velora AI Travel Twin • ${trip.destination} • Page ${p} of ${totalPages}`,
      pageWidth / 2,
      pageHeight - 20,
      { align: 'center' }
    );
  }

  doc.save(`velora_trip_${trip.destination.toLowerCase().replace(/\s+/g, '_')}.pdf`);
}

function drawFallbackImagePlaceholder(
  doc: jsPDF,
  x: number,
  y: number,
  w: number,
  h: number,
  title: string
) {
  doc.setFillColor(237, 242, 247);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(x, y, w, h, 4, 4, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  doc.text(title, x + w / 2, y + h / 2, { align: 'center' });
}

function loadImageAsDataUrl(url: string): Promise<string | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width || 640;
      canvas.height = img.height || 420;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        try {
          const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
          resolve(dataUrl);
        } catch {
          resolve(null);
        }
      } else {
        resolve(null);
      }
    };
    img.onerror = () => resolve(null);
    img.src = url;
  });
}
