import {Component} from "solid-js";

interface Props {
  color: string
}

const Splash: Component<Props> = (props) => {
  return (
    <svg width="29" height="26" viewBox="0 0 29 26" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path fill-rule="evenodd" clip-rule="evenodd" d="M5.81702 1.50887L5.81567 1.68046L5.89755 1.75947C5.94736 2.24823 6.02116 2.65301 6.11919 2.97401C6.20601 3.24409 6.35541 3.30657 6.56696 3.16123L6.68204 3.34324C6.77379 3.62826 6.71187 3.7788 6.49652 3.7951L6.54632 3.94995L6.82426 4.13581C6.94024 4.61371 7.13653 4.99741 7.41267 5.28695C7.54727 5.6881 7.74558 6.01161 8.00757 6.25698C8.0742 6.86504 8.31446 7.32664 8.72789 7.6418L8.58073 7.86116C8.8423 7.92206 9.04195 7.85664 9.17948 7.66489C9.778 7.93587 10.2926 7.82132 10.7238 7.32147C10.9726 7.17477 11.2178 7.07539 11.4592 7.02332L11.6126 6.97306L11.6328 6.86055L11.7111 6.7777L11.8479 6.67582L11.9262 6.59319L11.9442 6.47321C12.1705 6.29052 12.3401 6.12345 12.4529 5.97245C12.7412 5.94846 12.9725 5.87262 13.1466 5.74494C13.189 5.07395 13.3761 4.51023 13.7081 4.05384L13.5302 3.50101L13.2011 3.3319C13.1077 3.05843 13.0488 2.81711 13.0245 2.60794L12.9747 2.45309L12.9617 2.23735L12.7329 1.0253L13.0526 0.814538L13.1842 1.04839C13.1816 1.19033 13.208 1.33115 13.2637 1.47037C13.2302 2.0517 13.315 2.59954 13.5185 3.11389C13.8164 3.30404 14.008 3.55624 14.093 3.87047C14.2622 3.77698 14.3972 3.6785 14.4984 3.57459C14.4086 3.21306 14.3649 2.90968 14.3667 2.66477C14.4647 2.55113 14.5827 2.45808 14.7209 2.38564L14.8053 2.47212C14.7499 2.93553 14.7743 3.35389 14.8784 3.72717L14.7927 3.81206C14.4587 4.09549 14.1352 4.29381 13.8218 4.40742C13.4647 5.20336 13.4954 5.64144 13.914 5.72136C14.0908 5.45174 14.3304 5.33515 14.6328 5.37159C14.8472 5.50244 15.0245 5.59345 15.1649 5.64529C15.3441 5.70053 15.511 5.70008 15.6651 5.64416C15.8971 5.99709 16.5181 5.86964 17.5278 5.26157C17.7057 5.49656 17.7817 5.73222 17.7557 5.96902L17.9269 5.79878L18.0743 5.57941L18.1967 5.43317L18.3096 5.28217C18.4727 5.12008 18.6082 4.96432 18.7161 4.81491L18.9348 4.46629L19.2188 4.14505L19.2971 4.06219L19.3852 3.98454C19.6596 3.63388 19.9046 3.36606 20.1195 3.18159L20.1921 2.88073L20.74 2.7012L20.7933 3.01769C20.6096 3.11593 20.4418 3.17094 20.2895 3.18295L20.1693 3.33643L20.0887 3.41182L19.7702 3.8012C19.5239 4.03958 19.3386 4.26596 19.2138 4.4806C19.0965 4.58428 19.0075 4.70856 18.9464 4.85345C18.8388 4.95396 18.7605 5.05289 18.7111 5.15069C18.2856 5.5507 17.9782 5.96656 17.7889 6.39803C18.0386 6.75594 18.3077 7.02353 18.596 7.20058L18.7932 7.13583C19.1297 6.72676 19.4543 6.41413 19.7666 6.1975C19.6907 6.8307 19.4276 7.38422 18.9772 7.85759C19.09 8.55936 19.4258 8.69091 19.9842 8.2524C19.9036 8.43645 19.7708 8.53425 19.5862 8.54602L19.5505 8.78576C20.0586 8.793 20.4797 8.67121 20.8133 8.4206L21.3171 8.25534C21.4878 8.38416 21.6025 8.51478 21.6615 8.64766C21.126 9.02413 20.5755 9.26162 20.0099 9.36009L20.0395 9.62745C20.0775 9.72909 20.0929 9.83527 20.0855 9.94642C20.3675 9.90273 20.6066 9.84342 20.8032 9.76803C21.3886 10.0485 21.2274 10.1748 20.3195 10.1465L20.3516 10.4211C20.1654 10.6453 20.0537 10.8664 20.0164 11.0851L20.1445 11.1571L20.3143 11.1585C20.3742 11.1768 20.4276 11.1757 20.4747 11.1549L20.61 11.2243C21.1347 11.199 21.5628 11.208 21.8943 11.2515L21.7574 11.3534C21.1717 11.3389 20.6708 11.4462 20.2547 11.6751C20.45 11.9476 20.6768 12.134 20.9351 12.234C20.9566 12.3843 20.8794 12.4287 20.7036 12.3669C20.9526 12.8228 20.9553 13.2322 20.7112 13.5946C20.6044 14.0315 20.0941 13.9924 19.1802 13.4773L19.1954 13.7006L19.3605 14.0374C19.4891 14.1692 19.581 14.2882 19.6369 14.3949L20.0871 14.9153L20.169 14.9943C20.283 15.3479 20.4297 15.6366 20.6094 15.8602C20.4622 15.8215 20.3117 15.8138 20.1578 15.8371C20.2455 16.0255 20.3682 16.1726 20.5259 16.2786L20.9382 16.0293C21.1457 16.2057 21.3687 16.263 21.607 16.2009L21.8053 16.641C21.9863 16.6686 22.1292 16.6028 22.234 16.4434C22.1958 16.1572 22.0826 15.9148 21.8948 15.7155C21.7968 15.1937 21.5549 14.844 21.1693 14.6663L21.1491 14.453C21.489 14.4718 21.7732 14.4356 22.0022 14.3444C21.9659 14.4322 21.9161 14.5031 21.8524 14.5563L21.919 14.7627L22.0778 14.9305C22.1128 15.4405 22.2537 15.8777 22.5002 16.2421C22.6288 16.591 22.7066 16.8832 22.734 17.1187L22.3324 17.2502C22.2793 17.2025 22.2342 17.1794 22.1969 17.1807C21.7864 17.109 21.432 17.0947 21.1338 17.1382C21.0726 17.0985 21.0104 17.0809 20.9472 17.0854L20.8049 16.9691L20.6349 16.9679L20.5506 16.8814C20.2513 16.8545 19.9967 16.8076 19.7867 16.7409C19.5485 16.569 19.3293 16.4563 19.129 16.4026L18.9755 16.4529C18.932 17.3034 19.2046 17.9744 19.7932 18.4656C19.9033 18.8912 19.8735 19.1998 19.7037 19.3913C19.4414 19.1785 19.2548 18.9411 19.1433 18.6789C19.1622 17.6842 18.9358 17.3322 18.4643 17.6226L18.6969 17.9943C18.9396 18.6642 18.9221 18.8356 18.6444 18.5084C18.513 18.1333 18.325 17.842 18.0804 17.6344C18.3243 19.2272 17.8898 19.6494 16.7769 18.9008C16.6203 19.0663 16.4377 19.126 16.2293 19.0803L16.1153 18.7267C16.319 18.5404 16.4523 18.3855 16.5146 18.2617C16.2053 18.3036 15.9545 18.3858 15.7624 18.5085C15.8208 18.9402 15.8147 19.3141 15.7445 19.6304C15.4901 19.6431 15.3073 19.5349 15.1958 19.3053L15.0078 19.4239C14.921 19.9899 14.9957 20.5058 15.2317 20.9717L15.1117 21.125L15.0475 21.252C14.8582 21.4498 14.7283 21.6228 14.6576 21.7708C14.3617 21.9386 14.1233 22.109 13.9422 22.2824C13.551 22.2206 13.2129 22.0898 12.928 21.8899L12.8459 21.8109L12.7629 21.553C12.8426 21.0978 13.1566 20.7532 13.7056 20.5189C14.1352 19.9815 14.1042 19.6007 13.6122 19.3764C13.5571 19.1717 13.4637 18.9987 13.3321 18.8573C12.7387 18.3185 12.2243 18.376 11.7889 19.0291C11.8024 17.8843 11.5531 17.6864 11.0408 18.4355L10.7247 18.4819C10.6814 18.2139 10.6769 17.9737 10.7108 17.7616L9.89961 17.4736L9.49133 16.8823C9.27642 17.0342 9.05434 17.0881 8.82488 17.0439C8.52472 17.1478 8.25261 17.1637 8.00876 17.0915L8.14538 16.9896L8.29142 16.9418C8.7255 16.919 9.12034 16.8248 9.47611 16.6593C9.44807 16.4893 9.38279 16.3449 9.28027 16.2265C9.30808 16.1794 9.31392 16.1395 9.29799 16.1067L9.04988 16.188C8.69656 16.2278 8.40628 16.3041 8.17881 16.4166L6.12706 17.0894C5.82511 17.2046 5.55435 17.2744 5.31456 17.2988L5.39645 17.0518C5.66856 17.0278 5.89087 16.974 6.0629 16.8904L6.76393 16.6606C6.94923 16.5671 7.13183 16.5074 7.31152 16.4809L7.49951 16.3623L7.66214 16.3661L7.79876 16.2642L7.9522 16.214C8.41275 16.0902 8.7894 15.9475 9.08193 15.7863L8.96686 15.6043C8.84303 15.0692 8.67051 14.6424 8.44955 14.3237L8.56239 14.1727L8.44349 14.1546C8.31899 13.9347 8.1476 13.8037 7.92933 13.7611L7.86517 13.5621L8.08636 13.5467C8.21333 13.6735 8.32415 13.6751 8.41882 13.5517C8.27547 13.0557 8.23913 12.6004 8.31025 12.1862C8.24721 12.1742 8.20279 12.1536 8.17722 12.1239L8.01458 12.1201C7.75772 12.0415 7.52577 12.0062 7.31849 12.0144C7.75863 11.8104 8.11307 11.599 8.38184 11.3805C9.30563 11.6752 10.1587 11.7511 10.9417 11.6084L10.8753 11.4022C10.7027 11.1002 10.6054 10.7982 10.5834 10.4957L9.87072 10.3384C9.46513 10.2651 9.11071 10.2508 8.8076 10.2958C8.49174 10.117 8.18645 10.0299 7.8919 10.0342C7.48744 9.36293 6.98201 8.87959 6.37568 8.58414C5.43845 7.51199 4.36724 7.04315 3.16193 7.1776L2.84226 7.06259C2.63184 7.26181 2.43667 7.39923 2.25655 7.47461L2.0311 7.1004C1.37653 7.19005 0.828488 7.09293 0.387208 6.80859L1.18535 6.88081C1.48101 6.94669 1.75627 6.94895 2.01088 6.88715L2.1973 6.9399L2.39449 6.87538L2.61545 6.85998L2.7413 6.9245L3.08116 6.92722C3.25569 6.96774 3.41519 6.95348 3.55988 6.88421L3.69291 6.94646L4.30687 6.9734C4.72906 7.24778 5.12253 7.43364 5.48754 7.53121L5.64906 7.70643L5.84984 7.80354L5.95078 7.94141L6.09301 8.05777C6.14618 8.10554 6.19127 8.12863 6.22851 8.12727L6.32946 8.26536C6.38083 8.30815 6.42525 8.32898 6.46248 8.32762L6.54683 8.4141L6.64038 8.55445C6.68569 8.57755 6.7245 8.58117 6.75703 8.56509C7.02039 8.83177 7.2528 9.03529 7.45404 9.17564C7.59402 9.07535 7.74791 9.04389 7.91593 9.08101C7.95452 9.33456 8.10594 9.45341 8.36975 9.43734C8.38366 9.74793 8.51466 9.87064 8.76278 9.80544C8.84466 9.47447 8.96221 9.21321 9.11587 9.02173C8.76771 8.60903 8.35448 8.35346 7.87622 8.25517C7.71582 7.62335 7.43721 7.10107 7.04058 6.68792C7.04596 6.38751 6.91293 6.20844 6.6415 6.15071L6.50982 5.91709L6.82702 5.69886C7.07624 6.13849 7.32951 6.46559 7.58679 6.68002L7.49078 6.2062L7.35551 6.1367C7.2319 5.78626 7.05176 5.5112 6.81532 5.31178C6.75341 4.95184 6.65605 4.64983 6.52347 4.40533L6.17801 4.1846L6.11161 3.97837C6.01313 3.50545 5.84937 3.11381 5.62032 2.80347C5.62952 2.64839 5.60305 2.50758 5.54091 2.38149L5.47675 2.1825C5.48595 1.8264 5.44467 1.52235 5.35247 1.26996C5.47496 1.13209 5.54248 0.99875 5.55459 0.869715L5.70063 0.821948L5.81702 1.50887ZM10.6195 1.12379C11.0295 1.40541 11.2162 1.78255 11.1796 2.25505C11.0177 2.65416 10.7491 2.8201 10.3741 2.75264C9.89176 2.476 9.71273 2.06038 9.83658 1.50547C8.9388 0.895621 9.01374 0.393681 10.0611 0C10.4687 0.271659 10.6549 0.646071 10.6195 1.12379L10.6195 1.12379ZM7.49772 1.35765C7.04861 1.41175 7.00554 1.29426 7.3685 1.00517L7.49772 1.35765ZM3.79267 3.18227C3.59615 3.54109 3.26953 3.43175 2.813 2.85379L3.01579 2.81032C3.35251 2.94389 3.61161 3.06794 3.79262 3.18227H3.79267ZM7.20765 2.29123L7.41807 2.24618C7.43602 2.58032 7.36603 2.59526 7.20765 2.29123ZM16.1383 0.755911C16.4811 0.96735 16.7445 1.19871 16.9282 1.44979C16.9859 2.07123 16.7779 2.18963 16.3046 1.80544C15.8887 1.37169 15.8158 1.02579 16.0859 0.767021L16.1384 0.755928L16.0859 0.767021L16.1383 0.755911ZM4.2139 4.39884C3.87045 4.38277 3.85228 4.29674 4.15962 4.14122L4.2139 4.39884ZM9.48767 5.43796C9.0278 5.51538 8.97081 5.41939 9.31695 5.14977C9.4105 5.24598 9.46748 5.34197 9.48767 5.43796ZM16.4359 4.21686L16.5862 4.18472C16.582 4.41269 16.5319 4.42333 16.4359 4.21686ZM7.21006 6.36232L7.34915 6.27697C7.43013 6.51309 7.38392 6.54139 7.21006 6.36232ZM9.78492 7.10894C9.5727 6.99598 9.54354 6.8572 9.69698 6.69217L9.78492 7.10894ZM4.70159 9.28448C4.45819 9.49524 4.20021 9.6245 3.92762 9.67227C3.57632 10.0909 3.22975 10.1468 2.88765 9.84002C2.9056 9.32907 3.15505 8.9852 3.63577 8.80815C3.73201 8.54464 3.89061 8.36534 4.11113 8.27049C4.52882 8.51363 4.72555 8.85159 4.70155 9.28445L4.70159 9.28448ZM22.3482 5.22996C21.7732 5.43257 21.7165 5.33658 22.1775 4.94177L22.3482 5.22996ZM27.18 4.954L27.3902 4.90895C27.3692 5.15638 27.2992 5.17132 27.18 4.954ZM29 5.91818C28.7115 5.89011 28.6933 5.80431 28.9457 5.66033L29 5.91818ZM0.267426 11.9703C0.519795 12.1009 0.750634 12.1784 0.959725 12.2021C1.59953 12.4819 2.22694 12.5666 2.84206 12.4557L3.11776 12.7214C3.12494 12.9046 3.10497 13.0701 3.05741 13.2175C2.80055 13.3148 2.5603 13.3664 2.3364 13.3721L2.11297 13.3171C2.05621 13.2711 1.99609 13.2471 1.93283 13.2448L1.80183 13.1065L1.63291 13.0875C1.58512 13.0343 1.54317 13.009 1.50706 13.0114L1.33455 12.9377C1.13198 12.7962 0.951168 12.7081 0.79212 12.6737L0.717417 12.5788C0.434984 12.481 0.19742 12.3708 0.00404177 12.2485C-0.0125585 12.1202 0.0219884 12.0231 0.107459 11.9572C0.165111 11.9819 0.218278 11.9862 0.267408 11.9703L0.267426 11.9703ZM21.389 25.8068C21.4144 25.5218 21.3989 25.2769 21.3426 25.0722C21.3601 24.3688 21.2026 23.7499 20.8704 23.2161L21.0112 22.8587C21.177 22.7833 21.3363 22.74 21.4897 22.7292C21.6753 22.9329 21.8128 23.1385 21.9018 23.3458L21.935 23.5756C21.9139 23.6458 21.9144 23.711 21.9359 23.7712L21.8581 23.9455L21.9038 24.1108C21.8729 24.1755 21.8653 24.2242 21.8812 24.257L21.8778 24.4463C21.8238 24.6885 21.8107 24.8907 21.8386 25.0523L21.7796 25.158C21.7953 25.4587 21.7832 25.7224 21.7432 25.949C21.6315 26.0126 21.5292 26.0167 21.4368 25.9614C21.4377 25.8983 21.422 25.8469 21.389 25.8068L21.389 25.8068ZM26.6695 6.85356C26.5055 6.99437 26.3741 6.9672 26.2754 6.77183C26.2996 6.61336 26.3841 6.5056 26.5291 6.44811C26.5993 6.60725 26.6459 6.7424 26.6695 6.85356ZM21.219 8.29198L21.557 8.1086C21.5149 8.35536 21.4022 8.41648 21.219 8.29198ZM25.3538 9.67655L25.7327 10.1839L25.5241 10.3423C24.8594 10.156 24.6252 10.2242 24.8213 10.547C25.1948 10.4377 25.5261 10.4736 25.8151 10.6548L26.2299 10.6692L26.6381 10.6885C27.1155 10.7784 27.5541 10.7779 27.9543 10.6871C28.3635 10.1882 28.4877 9.65073 28.3267 9.07461L28.0079 8.64765C26.4901 7.89402 25.6056 8.23677 25.3538 9.67657L25.3538 9.67655ZM6.98305 12.7001C6.79819 12.6922 6.76635 12.6279 6.88725 12.5068L6.98305 12.7001ZM22.5944 9.19322L22.7445 9.16084C22.7613 9.38972 22.7113 9.40036 22.5944 9.19322ZM6.20202 14.8797C6.02637 14.7905 5.90815 14.6522 5.8478 14.4645C5.98711 14.2814 6.14549 14.1763 6.3227 14.1487C6.62376 14.4591 6.58338 14.7027 6.20201 14.8797L6.20202 14.8797ZM7.59914 14.3581L7.92778 14.1293C7.90827 14.5085 7.79857 14.5847 7.59914 14.3581ZM7.5177 14.9775C7.29024 15.0158 7.27924 14.9628 7.48428 14.8184L7.5177 14.9775ZM6.27673 15.4577L6.89254 15.3257C6.91071 15.834 6.70545 15.8781 6.27673 15.4577ZM22.6048 12.3357C22.4197 12.3013 22.2701 12.2621 22.1561 12.218L22.5505 12.0778C22.7264 12.167 22.7443 12.2528 22.6048 12.3357ZM24.5044 12.1498C24.7453 12.3253 24.7642 12.5007 24.5605 12.6766C24.0082 12.3409 23.4615 12.2046 22.9202 12.268C23.0012 12.1555 23.0963 12.0982 23.2058 12.0957C23.6542 12.2372 24.0872 12.2553 24.5044 12.1498L24.5044 12.1498ZM20.8436 12.8797C20.8283 12.7826 20.8671 12.719 20.9602 12.6884C20.9752 12.7855 20.9364 12.8491 20.8436 12.8797ZM27.2227 12.05C27.2039 12.9044 26.9986 12.9483 26.6069 12.1822C26.7249 12.0459 26.8344 11.9696 26.9355 11.9531L27.2227 12.05ZM7.17733 16.6746L6.90275 16.8998C6.42089 16.7235 6.41349 16.527 6.88076 16.3105C7.04251 16.4079 7.14144 16.5292 7.17733 16.6746L7.17733 16.6746ZM22.0915 13.6974C21.7963 13.8611 21.5448 13.8595 21.337 13.6929L21.8476 13.5833C21.7707 13.3673 21.829 13.2098 22.0226 13.1102C22.2608 13.2967 22.2837 13.4923 22.0915 13.6974L22.0915 13.6974ZM21.2431 13.7685C21.1033 13.9252 21.0107 13.9079 20.9654 13.7171L21.0704 13.6945L20.9654 13.7171L21.0704 13.6945L21.2431 13.7685ZM23.06 13.9727C22.8183 13.9928 22.6375 13.905 22.5177 13.709L22.8782 13.6315C23.1172 13.7228 23.1777 13.8366 23.06 13.9727ZM27.1627 14.5581C26.7813 14.9833 26.3426 15.0245 25.8465 14.682C25.6859 14.7639 25.5482 14.7936 25.4336 14.7707C25.4531 14.6396 25.5058 14.5545 25.5917 14.5149C25.5139 14.2202 25.5942 14.0049 25.8324 13.8692C26.4946 13.8328 26.9379 14.0623 27.1627 14.5581L27.1627 14.5581ZM9.69298 17.9252C9.38699 18.2602 9.17365 18.1792 9.05317 17.6822L9.51888 17.5824L9.69298 17.9252ZM13.3379 18.6088C13.5562 19.0741 13.6237 19.0596 13.5405 18.5651L13.3379 18.6088ZM10.5246 20.0835C10.2781 20.131 10.2451 20.0484 10.4252 19.8356L10.5246 20.0835ZM10.2742 20.6838C10.102 20.462 10.1428 20.308 10.3967 20.2218C10.5282 20.4735 10.4874 20.6275 10.2742 20.6838ZM24.9426 17.8067C24.7629 17.7236 24.6624 17.5817 24.6409 17.3802L24.9792 17.1968C25.2199 17.4461 25.2078 17.6494 24.9426 17.8067L24.9426 17.8067ZM5.97171 22.6916L5.92707 22.4795L6.01366 22.4054L6.10743 22.3298L6.13928 22.22L6.51885 21.9724L6.60521 21.8983L6.69921 21.8227C7.01798 21.5221 7.34976 21.3084 7.69456 21.1816C7.25038 21.9051 6.67612 22.4086 5.9717 22.6916L5.97171 22.6916ZM28.1517 18.4727C27.8661 18.6819 27.6754 18.633 27.5794 18.3262C27.6593 18.2087 27.7683 18.13 27.9063 18.0897C28.0413 18.2085 28.123 18.3362 28.1517 18.4727V18.4727ZM23.8102 20.3307C23.7564 20.3739 23.7283 20.4144 23.7257 20.4518C23.469 20.7234 23.2723 20.9822 23.1357 21.2278C21.7982 21.1135 21.7661 20.4525 23.0397 19.2445L23.3477 19.1784C23.7809 19.4711 23.935 19.855 23.8103 20.3307L23.8102 20.3307ZM19.1368 21.6579C18.7554 22.0831 18.5421 22.002 18.497 21.415C18.6513 21.3027 18.7989 21.2339 18.9402 21.209C19.0466 21.3657 19.1121 21.5153 19.1367 21.6579H19.1368ZM19.421 23.0069L19.6312 22.9619C19.6808 23.3209 19.6105 23.3358 19.421 23.0069Z" fill={props.color}/>
    </svg>
  )
}

export default Splash;
