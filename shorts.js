rules_version = '2';

service cloud.firestore {

  match /databases/{database}/documents {


    /* ================================
       VISITOR COUNTER
    ================================= */

    match /siteStats/{document} {

      allow read: if true;

      allow create, update: if true;

    }


    /* ================================
       SHORT STATS
    ================================= */

    match /shortStats/{shortId} {

      allow read: if true;

      allow create, update: if true;

    }


    /* ================================
       SHORT LIKES
    ================================= */

    match /shortLikes/{likeId} {

      allow read: if true;

      allow create:
        if request.auth != null
        && request.resource.data.uid ==
           request.auth.uid;

      allow delete:
        if request.auth != null
        && resource.data.uid ==
           request.auth.uid;

    }


    /* ================================
       SHORT COMMENTS
    ================================= */

    match /shortComments/{commentId} {

      allow read: if true;

      allow create:
        if request.auth != null
        && request.resource.data.uid ==
           request.auth.uid;

      allow delete:
        if request.auth != null
        && resource.data.uid ==
           request.auth.uid;

    }

  }

}
