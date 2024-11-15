import React, { useEffect, useRef, useState } from "react";
import SceneView from "@arcgis/core/views/SceneView";
import WebScene from "@arcgis/core/WebScene";
import FeatureLayer from "@arcgis/core/layers/FeatureLayer";
import MapImageLayer from "@arcgis/core/layers/MapImageLayer";
import Extent from "@arcgis/core/geometry/Extent";
import SpatialReference from "@arcgis/core/geometry/SpatialReference";
import Query from "@arcgis/core/rest/support/Query";
import Polyline from "@arcgis/core/geometry/Polyline";
import Point from "@arcgis/core/geometry/Point";
import Graphic from "@arcgis/core/Graphic";
import SimpleLineSymbol from "@arcgis/core/symbols/SimpleLineSymbol";
import SimpleRenderer from "@arcgis/core/renderers/SimpleRenderer";
import SimpleMarkerSymbol from "@arcgis/core/symbols/SimpleMarkerSymbol";
import proj4 from "proj4";
import simplify from "simplify-js";
import PopupTemplate from "@arcgis/core/PopupTemplate";
import TextSymbol from "@arcgis/core/symbols/TextSymbol";
import progressData from "./progress.json";
import Camera from "@arcgis/core/Camera";
import * as reactiveUtils from "@arcgis/core/core/reactiveUtils";
import { Photo } from '@mui/icons-material'; 

// Define the NAD_1983_Transverse_Mercator projection
const nad83TransverseMercator =
  'PROJCS["NAD_1983_Transverse_Mercator",GEOGCS["GCS_North_American_1983",DATUM["D_North_American_1983",SPHEROID["GRS_1980",6378137.0,298.257222101]],PRIMEM["Greenwich",0.0],UNIT["Degree",0.0174532925199433]],PROJECTION["Transverse_Mercator"],PARAMETER["False_Easting",0.0],PARAMETER["False_Northing",0.0],PARAMETER["Central_Meridian",-110.5],PARAMETER["Scale_Factor",0.9996],PARAMETER["Latitude_Of_Origin",31.0],UNIT["Meter",1.0]]';
let indexToDistance =
  "6596,10.000769365253642|17763,20.000130967233908|26655,30.000619783702902|32430,40.00025617618963|43792,50.00178101119446|56147,60.00051899196337|68111,70.00035673867256|79634,80.00037427972556|86828,90.00021247661235|98168,100.00007898675749|105506,110.00051067822282|118655,120.00024118198853|128078,130.00149534821313|133299,140.00110244679044|136635,150.00342464942457|138271,160.0023391407599|141674,170.0004318510005|152482,180.0005325617547|163727,190.00035708935587|174576,200.00045390751305|186796,210.0005427820703|200339,220.00076419880045|211845,230.0011759344872|222279,240.00037246621903|236404,250.00081984471495|247762,260.00052544996913|259406,270.00036706262756|271317,280.0013092708366|280673,290.00090307154517|292404,300.000470946827|302278,310.00014454074613|313849,320.0024829163231|327181,330.0005887361792|340463,340.00019938901244|355187,350.0002805660482|366862,360.00097622510515|378916,370.00095207823034|383288,380.00064996494024|385090,390.00067885574623|387115,400.0035973285679|390941,410.0002688493185|392591,420.0121866135612|393234,430.26469596329343|393268,440.19553098641717|393287,450.09883247308767|394966,460.0006697654468|406984,470.0003746499859|420108,480.0003059432993|429213,490.00241524905704|431670,500.00181457708334|443801,510.0005616400906|450254,520.0029203208311|451040,530.0122546743754|451982,540.0043961449896|462672,550.0000917361004|473265,560.0012776191377|482047,570.0026939581024|485535,580.001998148458|491860,590.0007782143324|502190,600.0010190375057|514113,610.0006188350252|526284,620.0002434940963|538987,630.0000720584508|547951,640.0241006752639|550841,650.001763889745|560787,660.0001936044821|571063,670.0004090144682|584666,680.0002588907532|597477,690.0007769935714|601471,700.0009709609224|602646,710.0002215949022|604733,720.0010361152089|607852,730.0016476966995|613982,740.000228604678|619340,750.0066143735919|626378,760.000347441734|635982,770.0005611655744|642089,780.0042659138284|645981,790.0001601581664|654548,800.0000145158433|670076,810.0004351411568|685036,820.000384726109|699650,830.0000269655349|716352,840.000642438914|731774,850.00061865249|742217,860.0005499196526|756751,870.0004881824686|772087,880.00010430576|787605,890.0000887946361|802915,900.0003146663133|819227,910.0002361296214|834067,920.0004019860725|849272,930.0005521983971|864081,940.0002845178918|878435,950.0001309106168|882092,960.002503320183|884976,970.0032494784306|886771,980.0016891507364|888328,990.0029937413431|890201,1000.0052222539729|893456,1010.0016815330565|897455,1020.0025614372447|898650,1030.0026992508829|899987,1040.0083628226125|901282,1050.006213958505|902814,1060.0027854969333|904328,1070.0051229730673|909723,1080.000015921445|923201,1090.0004504887643|937672,1100.001648091542|950270,1110.0007376638798|956661,1120.0016760398494|962778,1130.0004707596788|966096,1140.0029564972667|971300,1150.0018481230488|985717,1160.0006604311259|994971,1170.00024129117|1005621,1180.0001412854451|1008688,1190.0025852249444|1013585,1200.0015561057048|1016196,1210.0000090824776|1020163,1220.0018091026748|1024790,1230.0009802459322|1028279,1240.0012245894447|1032108,1250.0017006521318|1037999,1260.0000179211136|1053946,1270.0013006468419|1059534,1280.0004770941173|1072163,1290.0005561196688|1085530,1300.0005861872833|1099865,1310.0002662489603|1114874,1320.0001195998948|1130784,1330.0005065922323|1145034,1340.000072662555|1158298,1350.0005304676997|1170474,1360.0004614262793|1181430,1370.0000085902932|1196395,1380.000591365135|1209685,1390.0000547756463|1220938,1400.0003039296855|1234810,1410.000362121305|1244330,1420.0002149693466|1258504,1430.000752796549|1270239,1440.0003924092982|1273701,1450.0011101939263|1274906,1460.0062011422353|1278901,1470.0006962491577|1290767,1480.000433020411|1303281,1490.0005493157057|1316882,1500.0005975934823|1328632,1510.0008227572187|1341511,1520.0004466687658|1353835,1530.0006342566771|1360788,1540.000908188456|1366196,1550.0039255222223|1371321,1560.001024956857|1376907,1570.0007823955564|1383558,1580.0005207237668|1387215,1590.0024969878448|1388888,1600.0055598970011|1390073,1610.000928413579|1393359,1620.0025127315469|1398756,1630.0002250834275|1403945,1640.0005677482166|1411352,1650.0164989170878|1414134,1660.0004302949508|1417786,1670.0027766031208|1422489,1680.0019335268848|1425963,1690.002647133788|1435028,1700.0006907889804|1439400,1710.0022320140565|1442375,1720.0034988272012|1445758,1730.0011826748078|1449947,1740.000229243276|1460414,1750.0007866585088|1466030,1760.001060664211|1471483,1770.0015554289341|1477202,1780.0023230001739|1482974,1790.0000126247307|1488540,1800.0014180643132|1494129,1810.002501187854|1499973,1820.00146390624|1506077,1830.0005884922148|1512303,1840.0004927896612|1518221,1850.0003411815119|1523857,1860.0003191816575|1529433,1870.000023860029|1534864,1880.0001331876203|1540246,1890.0013784301896|1546562,1900.0005429964608|1548017,1910.0014932461377|1550536,1920.0018024947392|1553399,1930.0007425109097|1559151,1940.000846127157|1564782,1950.0009260765844|1570075,1960.0017616061405|1576039,1970.0004584305645|1581809,1980.0002423473418|1587102,1990.000495894309|1592307,2000.0006654615793|1597544,2010.0013940322817|1602882,2020.000439166142|1607365,2030.0018953041|1609903,2040.0010992606344|1612877,2050.0002457236797|1614479,2060.0080412357784|1616161,2070.00399721435|1620525,2080.0021512982007|1625789,2090.002202669998|1628489,2100.0038750924864|1635282,2110.0011410167053|1641140,2120.001058151051|1646994,2130.002638611987|1652616,2140.000447615239|1658774,2150.001193184287|1664559,2160.0004085519067|1669048,2170.003104781334|1670536,2180.002895781602|1676550,2190.0001920367463|1682563,2200.0001188558554|1687952,2210.0002302093167|1692508,2220.000249816229|1698271,2230.000486754315|1704325,2240.000191809391|1710221,2250.000311266561|1716017,2260.000152528856|1722024,2270.000602010022|1727056,2280.0008920348164|1732025,2290.000022570803|1736231,2300.000569491739|1741266,2310.002293110655|1746212,2320.0003986842216|1752320,2330.001594200597|1757570,2340.0004209156227|1763610,2350.000079259007|1769853,2360.0000056098033|1775891,2370.0000518197585|1782042,2380.0000677500047|1785267,2390.0028918054445|1786810,2400.0000789072587|1788917,2410.004845736413|1792755,2420.000802894753|1798708,2430.000279131136|1804789,2440.0012452464775|1811202,2450.0013205882024|1817453,2460.001142269295|1823393,2470.000214509075|1829188,2480.0003757934787|1831537,2490.0002042485107|1834170,2500.0036179699396|1840093,2510.000678833227|1847420,2520.001925383906|1849622,2530.0031836570724|1852430,2540.002285519058|1854920,2550.001996797318|1857058,2560.003461271961|1861735,2570.0007738277836|1867927,2580.0002093784724|1871309,2590.0001516814823|1875221,2600.0006580959084|1880207,2610.000173551777|1885349,2620.0014245378156|1889206,2630.0016242687225|1891495,2640.0011034632607|1895238,2650.0011106941047|1897083,2660.001542992339|1899654,2670.001435308939|1901055,2680.007339671532|1902783,2690.005819695542|1903979,2700.000866615818|1905383,2710.002921063586|1907337,2720.000814281119|1909357,2730.0125854009307|1910211,2740.006473155254|1911252,2750.003409522041|1913443,2760.000229236906|1916019,2770.0019168064246|1918801,2780.0028369435336|1923803,2790.000544099195|1926301,2800.0040502555526|1929203,2810.0014027809634|1932034,2820.0007978266376|1934713,2830.0011357754393|1937864,2840.001439632098|1940819,2850.0025668029484|1943562,2860.0005744047003|1946081,2870.002651409271|1948767,2880.0038341891395|1955577,2890.0014749878655|1961320,2900.0019365135277|1963904,2910.001958864477|1966065,2920.0025881772494|1968715,2930.0014907324785|1971052,2940.0002686911157|1974036,2950.002044558084|1976772,2960.003596541363|1979291,2970.001041223925|1981986,2980.0018928609657|1985344,2990.00049680176|1991513,3000.000576595621|1997840,3010.000198854555|2003555,3020.000325746106";
// Define the WGS84 projection
const wgs84 = "EPSG:4326";
let fullPath: number[][] = [];
const ESRIMap: React.FC = () => {
  const mapDiv = useRef<HTMLDivElement>(null);
  //const [polylineInfo, setPolylineInfo] = useState<string[]>([]);
  const viewRef = useRef<SceneView | null>(null); // Use a ref to store the view
  const [spatRef, setSpatRef] = useState<__esri.SpatialReference | null>(null);

  const parseIndexToDistance = (indexToDistance: string) => {
    const lookupTable: { index: number; distance: number }[] = [];
    const pairs = indexToDistance.split("|");
    pairs.forEach((pair) => {
      const [index, distance] = pair.split(",").map(Number);
      lookupTable.push({ index, distance });
    });
    return lookupTable;
  };

  const simplifyPath = (path: number[][], tolerance: number): number[][] => {
    const points = path.map(([x, y]) => ({ x, y }));
    const simplifiedPoints = simplify(points, tolerance, true);
    return simplifiedPoints.map((point) => [point.x, point.y]);
  };

  const findStartingIndex = (
    lookupTable: { index: number; distance: number }[],
    targetDistance: number
  ) => {
    for (let i = lookupTable.length - 1; i >= 0; i--) {
      if (lookupTable[i].distance < targetDistance) {
        return {
          index: lookupTable[i].index,
          distance: lookupTable[i].distance,
        };
      }
    }
    return { index: 0, distance: 0 }; // Default to start if no suitable index is found
  };

  //const indexToDistanceLookup = parseIndexToDistance(indexToDistance);
  useEffect(() => {
    console.log("FULLPATH in useEffect", fullPath.length);
  }, [fullPath]);
  useEffect(() => {
    if (spatRef && viewRef.current) {
      showProgress();
    }
    console.log("FULLPATH in spatRef", fullPath.length);
  }, [spatRef]);
  useEffect(() => {
    if (mapDiv.current) {
      const cdnstLayer = new FeatureLayer({
        url: "https://services1.arcgis.com/gGHDlz6USftL5Pau/arcgis/rest/services/ContinentalDivideNST/FeatureServer/0",
        renderer: new SimpleRenderer({
          symbol: new SimpleLineSymbol({
            color: [0, 0, 255], // Blue color
            width: 3, // Thicker line
          }),
        }),
      });

      const stateBoundariesLayer = new MapImageLayer({
        url: "https://services.arcgisonline.com/arcgis/rest/services/Reference/World_Boundaries_and_Places/MapServer",
      });

      const webscene = new WebScene({
        basemap: "satellite", // Use satellite imagery as the basemap
        ground: "world-elevation",
        layers: [cdnstLayer, stateBoundariesLayer],
      });

      const camera = new Camera({
        position: {
          latitude: 38.6,
          longitude: -106.4,
          z: 25000, // Height of the camera
        },
        tilt: 45, // Tilt the camera to 45 degrees
        heading: 0, // Direction the camera is facing
      });

      const view = new SceneView({
        container: mapDiv.current,
        map: webscene,
        // camera: camera, // Set the camera property
        ui: {
          components: ["zoom", "compass"],
        },
        extent: new Extent({
          xmin: -13884991,
          ymin: 2870341,
          xmax: -7455066,
          ymax: 6338219,
          spatialReference: new SpatialReference({ wkid: 102100 }),
        }),
      });

      viewRef.current = view; // Store the view in the ref
      cdnstLayer
        .when(() => {
          console.log("cdnstLayer loaded successfully");
          setSpatRef(cdnstLayer.spatialReference); // Set the spatRef variable
        })
        .catch((error) => {
          console.error("Failed to load cdnstLayer:", error);
        });
      return () => {
        if (view) {
          view.destroy();
        }
      };
    }
  }, []);

  const getPointsInPath = (
    fullPath: number[][],
    distanceAlongPath: number
  ): number[][] => {
    const lookupTable = parseIndexToDistance(indexToDistance);
    const { index: startIndex, distance: startingDistance } = findStartingIndex(
      lookupTable,
      distanceAlongPath
    );
    //debugger;
    let accumulatedDistance = startingDistance;
    const toRadians = (degrees: number) => degrees * (Math.PI / 180);
    const haversineDistance = (point1: number[], point2: number[]) => {
      const toRadians = (degrees: number) => degrees * (Math.PI / 180);
      // Project points from NAD_1983_Transverse_Mercator to WGS84
      const [lon1, lat1] = proj4(nad83TransverseMercator, wgs84, point1);
      const [lon2, lat2] = proj4(nad83TransverseMercator, wgs84, point2);
      const R = 6371; // Radius of the Earth in kilometers
      const dLat = toRadians(lat2 - lat1);
      const dLon = toRadians(lon2 - lon1);
      const lat1Rad = toRadians(lat1);
      const lat2Rad = toRadians(lat2);
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1Rad) *
          Math.cos(lat2Rad) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const distance = R * c; // Distance in kilometers
      return distance * 0.621371; // Convert to miles
    };
    const returnPath: number[][] = [];
    // Use a loop to push elements from the sliced array into the returnPath array
    const initialPoints = fullPath.slice(0, startIndex);
    for (const point of initialPoints) {
      returnPath.push(point);
    }
    for (let i = startIndex; i < fullPath.length - 1; i++) {
      const point1 = fullPath[i];
      const point2 = fullPath[i + 1];
      const distance = haversineDistance(point1, point2);
      accumulatedDistance += distance;
      returnPath.push(point1);
      if (accumulatedDistance >= distanceAlongPath) {
        returnPath.push(point2);
        break;
      }
    }
    return returnPath;
  };

  const showProgress = async () => {
    const featureLayer = new FeatureLayer({
      url: "https://services1.arcgis.com/gGHDlz6USftL5Pau/arcgis/rest/services/ContinentalDivideNST/FeatureServer/0",
    });
    const query = new Query({
      where: "objectid = 1493",
      returnGeometry: true,
      outFields: ["ObjectID"],
    });
    const result = await featureLayer.queryFeatures(query);
    let progressPathPoints: number[][] = [];
    result.features.forEach((feature) => {
      const geometry = feature.geometry;
      if (geometry.type === "polyline") {
        const polyline = geometry as Polyline;
        fullPath = polyline.paths[0];
        console.log("FULLPATH in query", fullPath.length);
        let view = viewRef.current;
        // Iterate through each element in progress.json and create a point graphic
        progressData.progress.forEach((data: any) => {
          let xys = getPointsInPath(fullPath, data.mile);
          let point = new Point({
            x: xys[xys.length - 1][0],
            y: xys[xys.length - 1][1],
          });
          let ll = proj4(nad83TransverseMercator, wgs84, [point.x, point.y]);
          point = new Point({
            longitude: ll[0],
            latitude: ll[1],
          });
          const popupTemplate = new PopupTemplate({
            title: `${data.date} - Mile ${data.mile}`,
            actions: [
              {
                title: "Show Larger Image",
                id: `showLargerImage`,
                className: data.image,
                image: `data:image/svg+xml;base64,${btoa('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM5 5h14v14H5V5zm7 12c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>')}`, 
                type: "button",
              },
            ],
            content: `
          <div>
          <div style="">
          <img src="${
            data.image
          }" alt="Random Image" style="margin-right:10px; ${
              data.aspect === "landscape"
                ? "width: 356px; height: 200px;"
                : "width: 200px; height: 356px;"
            } float:left;" />
          ${data.aspect === "landscape" ? "<br>" : ""}
          </div>

          <p style="font-size:8px;">LAT/LONG <b>${ll[1].toFixed(
            3
          )}, ${ll[0].toFixed(3)} </b></p><p>${data.text}
           </p>
           <p><b>Click the image for a larger view.</b></p>
          <div>
          `,
          });
          const pointGraphic = new Graphic({
            geometry: point,
            symbol: new SimpleMarkerSymbol({
              color: "orange",
              size: "12px",
              outline: {
                color: "white",
                width: 1,
              },
            }),
            popupTemplate: popupTemplate,
          });
          // let view = viewRef.current;
          view?.graphics.add(pointGraphic);
          // Create a text symbol for the label
          const textSymbol = new TextSymbol({
            text: `${data.date}`,
            color: "black",
            haloColor: "white",
            haloSize: "1px",
            xoffset: 3,
            yoffset: 3,
            font: {
              size: 12,
              family: "sans-serif",
            },
          });
          // Create a graphic with the text symbol
          const textGraphic = new Graphic({
            geometry: point,
            symbol: textSymbol,
          });
          view?.graphics.add(textGraphic);
        });
        reactiveUtils.on(
          () => view?.popup,
          "trigger-action",
          (event) => {
            if (event.action.id === "showLargerImage") {
              // Handle the "More Info" action
              let imageURL = event.action.className;
              openModal(imageURL);
              // Open a new window or perform other actions
            }
          }
        );
        // Get the distance parameter from the URL
        const urlParams = new URLSearchParams(window.location.search);
        const distanceParam = urlParams.get("d");
        let distance = distanceParam ? parseFloat(distanceParam) : 0;
        //if distance is 0, then iterate through each element in progress.json and set the distance to the highest mile value
        if (distance === 0) {
          progressData.progress.forEach((data: any) => {
            if (data.mile > distance) {
              distance = data.mile;
            }
          });
        }
        console.log("Distance:", distance);
        progressPathPoints = getPointsInPath(fullPath, distance);
      }
    });
    fullPath = [];
    const simplifiedPath = simplifyPath(progressPathPoints, 2); // Adjust tolerance as needed
    // Create a new polyline using the filtered points
    const newPolyline = new Polyline({
      paths: [simplifiedPath],
      spatialReference: spatRef || undefined,
    });
    // Create a graphic for the new polyline
    const polylineGraphic = new Graphic({
      geometry: newPolyline,
      symbol: new SimpleLineSymbol({
        color: [255, 0, 0], // Red color
        width: 2, // Thicker line
      }),
    });
    // Create a new feature layer for the new polyline
    const newFeatureLayer = new FeatureLayer({
      source: [polylineGraphic],
      fields: [
        {
          name: "ObjectID",
          alias: "ObjectID",
          type: "oid",
        },
      ],
      spatialReference: spatRef || undefined,
      objectIdField: "ObjectID",
      renderer: new SimpleRenderer({
        symbol: new SimpleLineSymbol({
          color: [255, 0, 0], // Red color
          width: 2, // Thicker line
        }),
      }),
    });
    newFeatureLayer.id = "progressLayer";
    viewRef.current?.map.add(newFeatureLayer);
  };
  // Function to open the modal
  const openModal = (imageSrc: string) => {
    const modal = document.getElementById("imageModal");
    const modalImg = document.getElementById("modalImage") as HTMLImageElement;
    modalImg.src = imageSrc;
    if (modal) {
      modal.style.display = "block";
    }
  };

  // const handleButtonClick = async () => {
  //   progressData.progress.forEach((data: any) => {
  //     let xys = getPointsInPath(fullPath, data.mile);
  //     let xy = xys[xys.length - 1];
  //     debugger;
  //     const point = new Point({
  //       x: xy[0],
  //       y: xy[1],
  //     });
  //     debugger;
  //     const pointGraphic = new Graphic({
  //       geometry: point,
  //       symbol: new SimpleMarkerSymbol({
  //         color: "orange",
  //         size: "12px",
  //         outline: {
  //           color: "white",
  //           width: 1,
  //         },
  //       }),
  //     });
  //     //view.graphics.add(pointGraphic);
  //   });
  // };
  // Function to close the modal
  const closeModal = () => {
    const modal = document.getElementById("imageModal");
    if (modal) {
      modal.style.display = "none";
    }
  };
  return (
    <div>
      <div style={{ height: "100vh", width: "100vw" }} ref={mapDiv}></div>
      {/* <button onClick={handleButtonClick}>Show Progress</button> */}

      {/* Modal HTML */}
      <div id="imageModal" className="modal">
        <span className="close" onClick={closeModal}>
          &times;
        </span>
        <img className="modal-content" id="modalImage" />
      </div>

      {/* Modal CSS */}
      <style>{`
        .modal {
          display: none;
          position: fixed;
          z-index: 1;
          padding-top: 60px;
          left: 0;
          top: 0;
          width: 100%;
          height: 100%;
          overflow: auto;
          background-color: rgb(0,0,0);
          background-color: rgba(0,0,0,0.9);
        }
        .modal-content {
          margin: auto;
          display: block;
          width: 80%;
          max-width: 700px;
        }
        .close {
          position: absolute;
          top: 15px;
          right: 35px;
          color: #f1f1f1;
          font-size: 40px;
          font-weight: bold;
          transition: 0.3s;
        }
        .close:hover,
        .close:focus {
          color: #bbb;
          text-decoration: none;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
};

export default ESRIMap;
