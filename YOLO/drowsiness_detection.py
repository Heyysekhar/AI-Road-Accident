"""
Driver Drowsiness Detection using MediaPipe Face Mesh
Run: python drowsiness_detection.py
"""
import cv2, sys

EAR_THRESHOLD = 0.25
CONSECUTIVE_FRAMES = 20

def ear(landmarks, indices, w, h):
    pts = [(int(landmarks[i].x * w), int(landmarks[i].y * h)) for i in indices]
    v1 = abs(pts[1][1] - pts[5][1])
    v2 = abs(pts[2][1] - pts[4][1])
    hz = abs(pts[0][0] - pts[3][0])
    return (v1 + v2) / (2.0 * hz + 1e-6)

def run():
    try:
        import mediapipe as mp
    except ImportError:
        print("pip install mediapipe")
        sys.exit(1)

    mp_face = mp.solutions.face_mesh
    mesh = mp_face.FaceMesh(max_num_faces=1, min_detection_confidence=0.7)
    LEFT  = [362,385,387,263,373,380]
    RIGHT = [33,160,158,133,153,144]

    cap = cv2.VideoCapture(0)
    count = 0
    alerted = False
    print("Drowsiness Detection Running... Press Q to quit.")

    while cap.isOpened():
        ret, frame = cap.read()
        if not ret: break
        h, w = frame.shape[:2]
        results = mesh.process(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB))
        status, color = "AWAKE", (0,255,0)

        if results.multi_face_landmarks:
            lm = results.multi_face_landmarks[0].landmark
            ratio = (ear(lm,LEFT,w,h) + ear(lm,RIGHT,w,h)) / 2.0
            if ratio < EAR_THRESHOLD:
                count += 1
                if count >= CONSECUTIVE_FRAMES:
                    status, color = "DROWSY - ALERT!", (0,0,255)
                    if not alerted:
                        print("DROWSINESS ALERT!")
                        alerted = True
            else:
                count = 0
                alerted = False
            cv2.putText(frame, f"EAR: {ratio:.2f}", (10,30), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255,255,0), 2)

        cv2.putText(frame, status, (10,70), cv2.FONT_HERSHEY_SIMPLEX, 1.0, color, 2)
        cv2.imshow("Drowsiness Detection", frame)
        if cv2.waitKey(1) & 0xFF == ord('q'): break

    cap.release()
    cv2.destroyAllWindows()

if __name__ == "__main__":
    run()
