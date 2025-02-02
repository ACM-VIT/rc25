import dynamic from "next/dynamic";
import React from "react";
import "./styles.scss";
import "./main.css";

const NoSSR = dynamic(() => import('./components/Board'), { ssr: false })

const Board = () => {
  return <NoSSR />;
};
export default Board;