"""
YOLOv8-based Accident Detection from CCTV / Video Feed
Run: python accident_detection.py --source 0  (webcam)
     python accident_detection.py --source video.mp4
"""
import cv2
import argparse
import sys

def run_detection(source=0, confidence=0.5):
    try:
        from ultralytics import YOLO
        model = YOLO("yolov8n.pt")
        print(f"YOLOv8 loaded. Starting on: {source}")
    except ImportError:
        print("ERROR: pip install ultralytics")
        sys.exit(1)

    cap = cv2.VideoCapture(source)
    if not cap.isOpened():
        print(f"Cannot open source: {source}")
        sys.exit(1)

    print("Detection running... Press Q to quit.")
    accident_frames = 0
    total_frames = 0

    while True:
        ret, frame = cap.read()
        if not ret:
            break
        total_frames += 1
        results = model(frame, conf=confidence, verbose=False)
        
        detected_classes = []
        for r in results:
            for box in r.boxes:
                cls_name = model.names[int(box.cls[0])]
                detected_classes.append(cls_name)

        vehicles = sum(1 for c in detected_classes if c in ["car","truck","motorcycle","bus"])
        persons  = sum(1 for c in detected_classes if c == "person")
        accident_detected = vehicles >= 2 and persons >= 1

        if accident_detected:
            accident_frames += 1
            cv2.putText(frame, "ACCIDENT DETECTED!", (30, 60),
                        cv2.FONT_HERSHEY_SIMPLEX, 1.2, (0, 0, 255), 3)

        annotated = results[0].plot()
        cv2.imshow("AI Accident Detection", annotated)

        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

    cap.release()
    cv2.destroyAllWindows()
    print(f"Summary: {accident_frames}/{total_frames} frames had accident signals")

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--source", default=0, help="0=webcam or video path")
    parser.add_argument("--conf", type=float, default=0.5)
    args = parser.parse_args()
    run_detection(args.source, args.conf)
