using UnityEngine;
using UnityEngine.XR.ARFoundation;
using System.Collections.Generic;

public class DiaPoteInteraction : MonoBehaviour
{
    public GameObject diaPotePrefab;
    private GameObject spawnedDiaPote;
    private ARRaycastManager raycastManager;
    private static List<ARRaycastHit> hits = new List<ARRaycastHit>();

    void Awake()
    {
        raycastManager = GetComponent<ARRaycastManager>();
    }

    void Update()
    {
        if (Input.touchCount > 0 && spawnedDiaPote == null)
        {
            Touch touch = Input.GetTouch(0);
            if (touch.phase == TouchPhase.Began)
            {
                if (raycastManager.Raycast(touch.position, hits, UnityEngine.XR.ARSubsystems.TrackableType.PlaneWithinPolygon))
                {
                    Pose hitPose = hits[0].pose;
                    spawnedDiaPote = Instantiate(diaPotePrefab, hitPose.position, hitPose.rotation);
                    Debug.Log("DiaPote invoqué ! Prêt pour l'éducation.");
                }
            }
        }
    }

    public void FeedCarbs(int amount) {
        // Logique pour montrer l'impact des glucides sur le petit compagnon
        Debug.Log($"Nourrissage avec {amount}g de glucides");
    }
}
