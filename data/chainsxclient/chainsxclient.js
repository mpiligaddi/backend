import React, { useState, useEffect } from "react";
import firebase from "../../Firebase";
import { useFocusEffect } from "@react-navigation/native";

const ChainsXClient = (clientId) => {
    const [categories, setCategories] = useState([])
    const [chains, setChains] = useState([])

    
  useEffect(() => {
    firebase.db.collection("categories").where("clientId", "==", clientId).get()
    .then((response) => {
      const idCategoriesArray = [];
      response.map((doc) => {
        idCategoriesArray.push(doc.data().ID);
      });
      getCategoriesXChain(idCategoriesArray).then((response) => {
        const chains = [];
        response.map((doc) => {
          const chain = doc.data();
          chain.ID = doc.ID;
          chains.push(chain);
        });
        setChains(chains);
    });
})}, [])

const getCategoriesXChain = (idCategoriesArray) => {
const arrayChains = [];
idCategoriesArray.map((categoryId) => {
const result = db.collection("catxchain").where("categoryId", "==", categoryId).get();
arrayChains.push(result);
});
return Promise.all(arrayChains);
};

}

